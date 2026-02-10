import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../core/hooks/useAuth'
import { ROLES, ROUTES } from '../core/utils/constants'

interface PrivateRouteProps {
    children: ReactNode
    requireManage?: boolean
}

const PrivateRoute = ({ children, requireManage }: PrivateRouteProps) => {
    const { isAuthenticated, user } = useAuth()
    const location = useLocation()

    if (!isAuthenticated) {
        return <Navigate to={ROUTES.LOGIN} replace state={{ from: location }} />
    }

    if (requireManage) {
        const canManage = user?.roleName === ROLES.ADMIN || user?.roleName === ROLES.HR
        if (!canManage) {
            return <Navigate to={ROUTES.FORBIDDEN} replace state={{ from: location }} />
        }
    }

    return <>{children}</>
}

export default PrivateRoute