import { createContext } from 'react'
import type { AuthState, AuthActions } from '../types/auth'

export const AuthContext = createContext<AuthState & AuthActions>({} as AuthState & AuthActions)