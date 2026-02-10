import { useReducer, useEffect, useState } from 'react'
import { AuthContext } from './AuthContext'
import { ThemeContext } from './ThemeContext'
import { authReducer, initialAuthState } from './authReducer'
import { tokenService } from '../services/token.service'
import type { User } from '../types/user'

interface AppProviderProps {
    children: React.ReactNode
}


const getInitialTheme = (): 'light' | 'dark' => {
    const defaultTheme = 'light' as const
    let theme: string | null = defaultTheme

    // 1. data-bs-theme-mode attribute
    if (document.documentElement.hasAttribute('data-bs-theme-mode')) {
        theme = document.documentElement.getAttribute('data-bs-theme-mode')
    }
    // 2. localStorage
    else if (localStorage.getItem('data-bs-theme') !== null) {
        theme = localStorage.getItem('data-bs-theme')
    }
    // 3. default
    else {
        theme = defaultTheme
    }

    // 4. system preference
    if (theme === 'system') {
        theme = window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light'
    }

    return theme as 'light' | 'dark'
}

/* ------------------------------------------------------------------ */
export const AppProvider = ({ children }: AppProviderProps) => {
    const [authState, dispatch] = useReducer(authReducer, initialAuthState)
    const [mode, setMode] = useState<'light' | 'dark'>(getInitialTheme)
    useEffect(() => {
        document.documentElement.setAttribute('data-bs-theme', mode)
        localStorage.setItem('data-bs-theme', mode)

    }, [mode])


    useEffect(() => {
        const token = tokenService.getToken()
        const user = tokenService.getUser()
        if (token && user) {
            dispatch({ type: 'LOGIN', payload: { token, user } })
        }
    }, [])

    const login = (token: string, user: User) => {
        tokenService.setToken(token)
        tokenService.setUser(user)
        dispatch({ type: 'LOGIN', payload: { token, user } })
    }

    const logout = () => {
        tokenService.removeToken()
        tokenService.removeUser()
        dispatch({ type: 'LOGOUT' })
    }

    const toggleTheme = () => {
        setMode((prev) => (prev === 'light' ? 'dark' : 'light'))
    }

    return (
        <AuthContext.Provider value={{ ...authState, login, logout }}>
            <ThemeContext.Provider value={{ mode, toggleTheme }}>
                {children}
            </ThemeContext.Provider>
        </AuthContext.Provider>
    )
}