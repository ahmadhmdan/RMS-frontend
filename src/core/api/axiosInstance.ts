import axios from 'axios'
import { API_URL } from '../../config/api.config'
import { tokenService } from '../../services/token.service'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../core/hooks/useAuth'

const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Request interceptor for token
axiosInstance.interceptors.request.use((config) => {
    const token = tokenService.getToken()
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// Response interceptor for errors
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            const navigate = useNavigate()
            const { logout } = useAuth()
            logout()
            navigate('/login')
        }
        return Promise.reject(error)
    },
)

export default axiosInstance