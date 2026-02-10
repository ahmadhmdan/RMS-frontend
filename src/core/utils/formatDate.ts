/**
 * Formats a date string (ISO) or Date object to a locale-friendly short date.
 * Example: "2025-06-10T00:00:00.000Z" → "6/10/2025"
 */
export const formatDate = (date: string | Date | null | undefined): string => {
    if (!date) return '-'

    // Accept both string and Date
    const d = typeof date === 'string' ? new Date(date) : date

    // Guard against invalid dates
    if (Number.isNaN(d.getTime())) return '-'

    return d.toLocaleDateString() // uses browser locale
}