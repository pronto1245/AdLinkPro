import axios from "axios"

export async function login(data: {
  email?: string
  username?: string
  password: string
}) {
  const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5050",
    headers: {
      "Content-Type": "application/json"
    },
    withCredentials: true
  })

  const res = await api.post("/api/auth/login", data)
  return res.data
}
