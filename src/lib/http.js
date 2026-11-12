import axios from 'axios'
import { normalizeError } from '@/util/errors'

/**
 * Shared axios instance for all API calls.
 *
 * - Base URL comes from VITE_API_BASE_URL (see .env).
 * - Every request gets a timeout so the UI never hangs forever.
 * - Auth is pluggable: call setAuthTokenProvider() once (e.g. after login)
 *   and the token is attached to every request automatically.
 * - Errors are normalized to ApiError (src/util/errors.js).
 *
 * Use this from src/api/*.js service modules, not directly in components.
 * Pass an AbortSignal (`{ signal }`) from components that can unmount
 * mid-request, e.g. in onBeforeUnmount.
 */
export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10_000,
  headers: {
    Accept: 'application/json',
  },
})

let getAuthToken = () => null
let onUnauthorized = () => {}

/** Provide a function returning the current access token (or null). */
export function setAuthTokenProvider(fn) {
  getAuthToken = fn
}

/** Called on HTTP 401 responses, e.g. to redirect to a login page. */
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn
}

http.interceptors.request.use((config) => {
  const token = getAuthToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const normalized = normalizeError(error)
    if (normalized?.status === 401) {
      onUnauthorized(normalized)
    }
    return Promise.reject(normalized)
  },
)
