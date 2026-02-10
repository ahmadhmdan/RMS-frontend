import { createContext } from 'react'

interface ThemeContextType {
    mode: 'light' | 'dark'
    toggleTheme: () => void
}

export const ThemeContext = createContext<ThemeContextType>({
    mode: 'light',
    toggleTheme: () => { },
})