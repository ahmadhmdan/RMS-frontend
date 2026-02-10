import { useState, useEffect } from 'react'
import { countryService } from '../services/Country.service'

export const useCountriesSelect = () => {
    const [countries, setCountries] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        fetchCountries()
    }, [])

    const fetchCountries = async () => {
        setLoading(true)
        try {
            const res = await countryService.getAll()
            const formattedCountries = res.data.data.map((country: any) => ({
                value: country.id,
                label: country.name,
            }))
            setCountries(formattedCountries)
        } catch (error) {
            // handle error
        } finally {
            setLoading(false)
        }
    }

    return {
        countries,
        loading,
    }
}