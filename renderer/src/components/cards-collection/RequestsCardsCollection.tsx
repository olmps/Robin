import React from 'react'

import RequestCard from './card/RequestCard'

import { RequestCycle } from '../../models'
import { isInformationalStatusCode, isSuccessStatusCode, isRedirectStatusCode, isClientErrorStatusCode, isServerErrorStatusCode } from '../../models/status-code'

import requestIcon from '../../resources/assets/requests-details/cards/compare_arrows.svg'
import clockIcon from '../../resources/assets/requests-details/cards/clock.svg'
import memoryIcon from '../../resources/assets/requests-details/cards/memory.svg'

import informationIcon from '../../resources/assets/requests-details/stats/information.svg'
import successIcon from '../../resources/assets/requests-details/stats/success.svg'
import redirectIcon from '../../resources/assets/requests-details/stats/redirect.svg'
import syncIcon from '../../resources/assets/requests-details/stats/sync.svg'
import clientErrorIcon from '../../resources/assets/requests-details/stats/client_error.svg'
import serverErrorIcon from '../../resources/assets/requests-details/stats/server_error.svg'

import './RequestsCardsCollection.css'
import '../../extensions/number'

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

const SingleRequestCardsCollection = ({ cycle }: { cycle: RequestCycle }) => {
  const statusCode = cycle.statusCode?.toString() ?? "-"
  const statusCdIcon = statusCodeIcon(cycle.statusCode)

  const requestTime = cycle.isComplete ? formatDuration(cycle.duration) : "-"
  const requestSize = cycle.size().sizeFormatted()

  return (
    <div className="CardsCollection">
      <RequestCard iconPath={statusCdIcon} title={statusCode} subtitle="Status Code" />
      <RequestCard iconPath={clockIcon} title={requestTime} subtitle="Request Time" />
      <RequestCard iconPath={memoryIcon} title={requestSize} subtitle="Data Transferred" />
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
  const formattedDuration = formatDuration(averageDuration)

  const totalSize = completeCycles.reduce((a, b) => a + b.size(), 0)

  return [cycles.length.toString(), formattedDuration, totalSize.sizeFormatted()]
}

function formatDuration(duration: number): string {
  return duration >= 1000 ?
    `${new Date(duration).getSeconds().toFixed(0)} s` :
    `${duration.toFixed(0)} ms`
}

function statusCodeIcon(statusCode: number | undefined): string {
  if (!statusCode) { return syncIcon }

  if (isInformationalStatusCode(statusCode)) { return informationIcon }
  if (isSuccessStatusCode(statusCode)) { return successIcon }
  if (isRedirectStatusCode(statusCode)) { return redirectIcon }
  if (isClientErrorStatusCode(statusCode)) { return clientErrorIcon }
  if (isServerErrorStatusCode(statusCode)) { return serverErrorIcon }

  return syncIcon
}

export { RequestsCardsCollection, SingleRequestCardsCollection }