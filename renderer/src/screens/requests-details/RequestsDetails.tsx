import React from 'react'
import { Doughnut } from 'react-chartjs-2'

// Models
import { RequestCycle } from '../../models'

// Components
import RequestCard from './components/RequestCard'

// Utils
import { requestsStats, doughnutChartData, doughnutChartOptions } from './RequestsDetailsUtils'

// Assets
import requestIcon from '../../resources/assets/compare_arrows.svg'
import clockIcon from '../../resources/assets/clock.svg'
import memoryIcon from '../../resources/assets/memory.svg'

// Style
import './RequestsDetails.css'

const RequestsDetails = ({ cycles }: { cycles: RequestCycle[] }) => {
    const [requestsAmount, averageDuration, totalSize] = requestsStats(cycles)

    return (
        <>
            <div className="ContentColumn">
                <div className="ContentColumnWrapper">
                    <div className="CardsCollection">
                        <RequestCard iconPath={requestIcon} title={requestsAmount} subtitle="Requests" />
                        <RequestCard iconPath={clockIcon} title={averageDuration} subtitle="Average Time" />
                        <RequestCard iconPath={memoryIcon} title={totalSize} subtitle="Data Transferred" />
                    </div>
                <div className="DoughnutChart">
                    <Doughnut data={doughnutChartData(cycles)} options={doughnutChartOptions()} />
                </div>
                </div>
            </div>
        </>
    )
}

export default RequestsDetails