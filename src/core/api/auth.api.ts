import axiosInstance from './axiosInstance'
import type { LoginDto } from '../../types/auth'

export const loginApi = (data: LoginDto) => axiosInstance.post('/login', data)