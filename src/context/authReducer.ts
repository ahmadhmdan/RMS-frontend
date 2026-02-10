import type { AuthState, AuthAction } from '../types/auth'

export const initialAuthState: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
}

export const authReducer = (state: AuthState, action: AuthAction): AuthState => {
    switch (action.type) {
        case 'LOGIN':
            return {
                ...state,
                user: action.payload.user,
                token: action.payload.token,
                isAuthenticated: true,
            }
        case 'LOGOUT':
            return initialAuthState
        default:
            return state
    }
}