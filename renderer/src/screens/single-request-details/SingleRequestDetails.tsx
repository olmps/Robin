import React, { useState } from 'react'
import SyncLoader from "react-spinners/SyncLoader"

import { RequestCycle } from '../../models'
import { ContentType } from '../../shared'

import { SingleRequestCardsCollection } from '../../components/cards-collection/RequestsCardsCollection'
import SegmentedControl from '../../components/segmented-control/SegmentedControl'
import RequestInfoTable from './components/general-info-table/RequestInfoTable'
import RequestContainer from '../components/request-content-container/RequestContainer'

import './SingleRequestDetails.css'
import '../../extensions/string'

class SingleRequestState {
  constructor(public selectedSegmentIndex: number = 0) { }
}

enum Tab {
  generalInformation = 0,
  request = 1,
  response = 2
}

const SingleRequestDetails = (props: { selectedCycle: RequestCycle }) => {
  const [state, setState] = useState(new SingleRequestState())

  const segmentItems = ["General Info", "Request", "Response"]

  const segmentSelectionHandler = (selectedIndex: number) => {
    setState({
      ...state, selectedSegmentIndex: selectedIndex
    })
  }

  return (
    <>
      <div className="ContentColumn">
        <SingleRequestCardsCollection cycle={props.selectedCycle} />
        <SegmentedControl items={segmentItems} selectionHandler={segmentSelectionHandler} />
        <InformationContainer cycle={props.selectedCycle} selectedTab={state.selectedSegmentIndex} />
      </div>
    </>
  )
}

const InformationContainer = (props: { cycle: RequestCycle, selectedTab: Tab }) => {
  switch (props.selectedTab) {
    case Tab.generalInformation: return <RequestInfoTable cycle={props.cycle} />
    case Tab.request: {
      const { cycleId, rawMethod, url, headers, body } = props.cycle.request
      const requestContent = { cycleId, method: rawMethod, path: url, headers, body }
      return <RequestContainer content={requestContent} type={ContentType.request} readOnly={true} />
    }
    case Tab.response: {
      if (props.cycle.response === undefined) { return <WaitingResponseEmptyState /> }

      const { cycleId, status, statusCode, headers, body } = props.cycle.response
      const responseContent = { cycleId, status, statusCode, headers, body }
      return <RequestContainer content={responseContent} type={ContentType.response} readOnly={true} />
    }
  }
}

const WaitingResponseEmptyState = () => {

  return (
    <div className="CenteredContent">
      <SyncLoader color="#FFF" />
      <p className="EmptyTitle">Waiting Response</p>
      <p className="EmptyMessage">This request has no response yet.</p>
      <p className="EmptyMessage">Once it arrives, the response content will appear here.</p>
    </div>
  )
}

export default SingleRequestDetails