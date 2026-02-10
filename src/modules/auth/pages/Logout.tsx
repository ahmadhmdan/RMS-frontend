// Logout is handled in context; this can be a redirect component if needed
import { useEffect } from 'react'
import { useAuth } from '../../../core/hooks/useAuth'
import { useNavigate } from 'react-router-dom'

const Logout = () => {
    const { logout } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        logout()
        navigate('/login')
    }, [logout, navigate])

    return null
}

export default Logout