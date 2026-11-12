import axios from 'axios'

/**
 * Normalized error thrown by the shared HTTP client.
 * Components and stores can rely on this shape regardless of where the
 * failure happened (network, timeout, HTTP status, or request setup).
 */
export class ApiError extends Error {
  /**
   * @param {object} options
   * @param {string} options.message  Human-readable message
   * @param {number|null} [options.status]  HTTP status, null for network/timeout
   * @param {string|null} [options.code]    Axios error code, e.g. ECONNABORTED
   * @param {unknown} [options.data]        Response body, if any
   * @param {unknown} [options.cause]       Original error
   */
  constructor({ message, status = null, code = null, data = null, cause } = {}) {
    super(message, { cause })
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.data = data
  }
}

const DEFAULT_MESSAGES = {
  network: 'Unable to reach the server. Check your connection and try again.',
  timeout: 'The request timed out. Please try again.',
  unknown: 'Something went wrong. Please try again.',
}

/**
 * Convert any thrown value from axios into an ApiError.
 * Cancelled requests are returned untouched so callers can detect them with
 * `axios.isCancel(err)` and ignore them.
 */
export function normalizeError(error) {
  if (axios.isCancel(error)) return error
  if (error instanceof ApiError) return error

  if (axios.isAxiosError(error)) {
    const { response, code } = error

    if (response) {
      const serverMessage =
        response.data?.message ?? response.data?.error ?? null
      return new ApiError({
        message: serverMessage || `Request failed with status ${response.status}`,
        status: response.status,
        code,
        data: response.data,
        cause: error,
      })
    }

    const isTimeout = code === 'ECONNABORTED' || code === 'ETIMEDOUT'
    return new ApiError({
      message: isTimeout ? DEFAULT_MESSAGES.timeout : DEFAULT_MESSAGES.network,
      status: null,
      code,
      cause: error,
    })
  }

  return new ApiError({
    message: error?.message || DEFAULT_MESSAGES.unknown,
    cause: error,
  })
}
