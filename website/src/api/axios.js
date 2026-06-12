import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost/lms/lms/public/api',
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
})

export default api
