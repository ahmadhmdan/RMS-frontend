export interface LoginDto {
    username: string
    password: string
}

export interface LoginResponseData {
    access_token: string
    rememberToken: string
    user: User
}

export interface LoginResponse {
    success: boolean
    message: string
    data: LoginResponseData
}

export interface AuthState {
    user: User | null
    token: string | null
    isAuthenticated: boolean
}

export type AuthAction =
    | { type: 'LOGIN'; payload: { token: string; user: User } }
    | { type: 'LOGOUT' }

export interface AuthActions {
    login: (token: string, user: User) => void
    logout: () => void
}