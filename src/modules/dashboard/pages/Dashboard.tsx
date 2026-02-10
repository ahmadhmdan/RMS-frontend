import { useAuth } from '../../../core/hooks/useAuth'
import { Row, Col } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import StatsCard from '../components/StatsCard'

const Dashboard = () => {
    const { user } = useAuth()
    const { t } = useTranslation()

    return (
        <div>
            <h1>{t('dashboard.welcome', { username: user?.username })}</h1>
            <Row>
                <Col md={4}>
                    <StatsCard title={t('dashboard.stats')} value="100" />
                </Col>

            </Row>
        </div>
    )
}

export default Dashboard