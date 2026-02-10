import type { User } from '../types/user'

export const tokenService = {
    getToken: () => localStorage.getItem('token'),
    setToken: (token: string) => localStorage.setItem('token', token),
    removeToken: () => localStorage.removeItem('token'),
    getUser: (): User | null => {
        const user = localStorage.getItem('user')
        return user ? JSON.parse(user) : null
    },
    setUser: (user: User) => localStorage.setItem('user', JSON.stringify(user)),
    removeUser: () => localStorage.removeItem('user'),
}