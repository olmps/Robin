import React from 'react'

// Components
import RequestCard from './card/RequestCard'

// Models
import { RequestCycle } from '../../../../models'

// Assets
import requestIcon from '../../../../resources/assets/requests-details/cards/compare_arrows.svg'
import clockIcon from '../../../../resources/assets/requests-details/cards/clock.svg'
import memoryIcon from '../../../../resources/assets/requests-details/cards/memory.svg'

// Style
import './RequestsCardsCollection.css'

const RequestsCardsCollection = ({ cycles }: { cycles: RequestCycle[] }) => {
  const [requestsAmount, averageDuration, totalSize] = requestsStats(cycles)

  return (
    <div className="CardsCollection">
      <RequestCard iconPath={requestIcon} title={requestsAmount} subtitle="Requests" />
      <RequestCard iconPath={clockIcon} title={averageDuration} subtitle="Average Time" />
      <RequestCard iconPath={memoryIcon} title={totalSize} subtitle="Data Transferred" />
    </div>
  )
}

/**
 * Retrieve and formats the stats - amount, average duration and total size - from 
 * all **complete** cycles.
 */
function requestsStats(cycles: RequestCycle[]): [string, string, string] {
  if (cycles.length === 0) { return ["0", "0", "0"] }

  const completeCycles = cycles.filter(cycle => cycle.isComplete)

  const averageDuration = completeCycles.reduce((a, b) => a + b.duration, 0) / cycles.length
  const formattedDuration = averageDuration >= 1000 ? `${new Date(averageDuration).getSeconds().toFixed(0)} s` :
    `${averageDuration.toFixed(0)} ms`

  const totalSize = completeCycles.reduce((a, b) => a + b.size(), 0)

  return [completeCycles.length.toString(), formattedDuration, formatBytes(totalSize)]
}

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(0)) + ' ' + sizes[i];
}

export default RequestsCardsCollection