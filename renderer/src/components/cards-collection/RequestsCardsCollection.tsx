import React from 'react'

import RequestCard from './card/RequestCard'

import { RequestCycle } from '../../models'
import { isInformationalStatusCode, isSuccessStatusCode, isRedirectStatusCode, isClientErrorStatusCode, isServerErrorStatusCode } from '../../models/status-code'

import { ReactComponent as RequestIcon } from '../../resources/assets/requests-details/cards/compare_arrows.svg'
import { ReactComponent as ClockIcon } from '../../resources/assets/requests-details/cards/clock.svg'
import { ReactComponent as MemoryIcon } from '../../resources/assets/requests-details/cards/memory.svg'

import { ReactComponent as InformationIcon } from '../../resources/assets/requests-details/stats/information.svg'
import { ReactComponent as SuccessIcon } from '../../resources/assets/requests-details/stats/success.svg'
import { ReactComponent as RedirectIcon } from '../../resources/assets/requests-details/stats/redirect.svg'
import { ReactComponent as SyncIcon } from '../../resources/assets/requests-details/stats/sync.svg'
import { ReactComponent as ClientErrorIcon } from '../../resources/assets/requests-details/stats/client_error.svg'
import { ReactComponent as ServerErrorIcon } from '../../resources/assets/requests-details/stats/server_error.svg'
import { ReactComponent as BlockedIcon } from '../../resources/assets/disclosure-list/drop_request_icon.svg'

import './RequestsCardsCollection.css'
import '../../extensions/number'

const RequestsCardsCollection = (props: { cycles: RequestCycle[] }) => {
  const [requestsAmount, averageDuration, totalSize] = requestsStats(props.cycles)

  return (
    <div className="CardsCollection">
      <RequestCard icon={<RequestIcon className="CardIcon" />} title={requestsAmount} subtitle="Requests" />
      <RequestCard icon={<ClockIcon className="CardIcon" />} title={averageDuration} subtitle="Average Time" />
      <RequestCard icon={<MemoryIcon className="CardIcon" />} title={totalSize} subtitle="Data Transferred" />
    </div>
  )
}

const SingleRequestCardsCollection = (props: { cycle: RequestCycle }) => {
  const statusCode = props.cycle.request.dropped ? "Blocked" : props.cycle.statusCode?.toString() ?? "Waiting"
  const statusCdIcon = props.cycle.request.dropped ? <BlockedIcon className="CardIcon Red" /> : statusCodeIcon(props.cycle.statusCode)

  const requestTime = props.cycle.isComplete ? formatDuration(props.cycle.duration) : "-"
  const requestSize = props.cycle.size().sizeFormatted()

  return (
    <div className="CardsCollection">
      <RequestCard icon={statusCdIcon} title={statusCode} subtitle="Status Code" />
      <RequestCard icon={<ClockIcon className="CardIcon" />} title={requestTime} subtitle="Request Time" />
      <RequestCard icon={<MemoryIcon className="CardIcon" />} title={requestSize} subtitle="Data Transferred" />
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

function statusCodeIcon(statusCode: number | undefined): JSX.Element {
  if (!statusCode) { return <SyncIcon className="CardIcon" /> }

  if (isInformationalStatusCode(statusCode)) { return <InformationIcon className="CardIcon" /> }
  if (isSuccessStatusCode(statusCode)) { return <SuccessIcon className="CardIcon" /> }
  if (isRedirectStatusCode(statusCode)) { return <RedirectIcon className="CardIcon" /> }
  if (isClientErrorStatusCode(statusCode)) { return <ClientErrorIcon className="CardIcon" /> }
  if (isServerErrorStatusCode(statusCode)) { return <ServerErrorIcon className="CardIcon" /> }

  return <SyncIcon className="CardIcon" />
}

export { RequestsCardsCollection, SingleRequestCardsCollection }