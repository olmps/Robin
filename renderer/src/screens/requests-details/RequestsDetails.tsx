import React from 'react'

import { RequestCycle } from '../../models'

import RequestsStats from './components/stats/RequestsStats'
import RequestsMap from './components/map/RequestsMap'
import RequestsDistribution from './components/distribution/RequestsDistribution'
import { RequestsCardsCollection } from '../../components/cards-collection/RequestsCardsCollection'

import './RequestsDetails.css'

const RequestsDetails = ({ cycles }: { cycles: RequestCycle[] }) => {
  return (
    <>
      <div className="ContentColumn">
        <RequestsCardsCollection cycles={cycles} />
        <h2>Distribution</h2>
        <RequestsDistribution cycles={cycles} />
        <h2>Stats</h2>
        <RequestsStats cycles={cycles} />
        <h2>Connections Map</h2>
        <RequestsMap cycles={cycles} />
      </div>
    </>
  )
}

export default RequestsDetails