import { Card } from 'react-bootstrap'

interface StatsCardProps {
    title: string
    value: string
}

const StatsCard = ({ title, value }: StatsCardProps) => {
    return (
        <Card className="mb-4">
            <Card.Body>
                <Card.Title>{title}</Card.Title>
                <Card.Text>{value}</Card.Text>
            </Card.Body>
        </Card>
    )
}

export default StatsCard