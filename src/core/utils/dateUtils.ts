/**
 * Calculates working days between start and end (excludes Friday & Saturday)
 */
export const calculateWorkingDays = (startDate: string, endDate: string): number => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    let workingDays = 0

    const current = new Date(start)
    while (current <= end) {
        const day = current.getDay() // 0 = Sunday, 5 = Friday, 6 = Saturday
        if (day !== 5 && day !== 6) {
            workingDays++
        }
        current.setDate(current.getDate() + 1)
    }

    return workingDays
}