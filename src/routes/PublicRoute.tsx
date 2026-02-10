import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../core/hooks/useAuth'
import { ROUTES } from '../core/utils/constants'

interface PublicRouteProps {
    children: ReactNode
}

const PublicRoute = ({ children }: PublicRouteProps) => {
    const { isAuthenticated } = useAuth()

    return !isAuthenticated ? <>{children}</> : <Navigate to={ROUTES.DASHBOARD} replace />
}

export default PublicRoute