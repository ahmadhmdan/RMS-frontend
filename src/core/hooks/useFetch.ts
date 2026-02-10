import { useState, useEffect } from 'react'
import axiosInstance from '../../core/api/axiosInstance'

export const useFetch = <T>(url: string) => {
    const [data, setData] = useState<T | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                const response = await axiosInstance.get<T>(url)
                setData(response.data)
            } catch (err) {
                setError((err as Error).message)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [url])

    return { data, loading, error }
}