import { api as _api, json as _json, API_BASE } from '../services/http'

export const api = _api
export const json = _json
export { API_BASE }
export default api

export async function login(email: string, password: string) {
  return json('/api/auth/login', { email, password })
}
