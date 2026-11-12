import { http } from '@/lib/http'

/**
 * Example service module. Keep one module per backend resource and
 * return plain data (not axios responses) so components stay axios-free.
 *
 * @param {object} [options]
 * @param {AbortSignal} [options.signal]  Cancel the request on unmount
 * @returns {Promise<Array<{id: number, name: string}>>}
 */
export async function getItems({ signal } = {}) {
  const { data } = await http.get('/items', { signal })
  return data
}
