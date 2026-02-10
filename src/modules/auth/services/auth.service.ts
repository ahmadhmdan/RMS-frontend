import { loginApi } from '../../../core/api/auth.api'
import type { LoginDto, LoginResponse } from '../../../types/auth'

export const authService = {
    login: async (data: LoginDto): Promise<LoginResponse> => {
        const response = await loginApi(data)
        return response.data
    },
}