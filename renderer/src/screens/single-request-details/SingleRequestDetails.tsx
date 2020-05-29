import React, { useState } from 'react'
import BounceLoader from "react-spinners/BounceLoader"

import { RequestCycle } from '../../models'
import { ContentType } from '../../shared'

import { SingleRequestCardsCollection } from '../../components/cards-collection/RequestsCardsCollection'
import SegmentedControl from '../../components/segmented-control/SegmentedControl'
import RequestInfoTable from './components/general-info-table/RequestInfoTable'
import RequestContainer from '../components/request-content-container/RequestContainer'

import './SingleRequestDetails.css'
import '../../extensions/string'

class SingleRequestState {
  constructor(
    public selectedSegmentIndex: number = 0,
    public truncateTitle: boolean = true
  ) { }
}

const SingleRequestDetails = (props: { selectedCycle: RequestCycle }) => {
  const [state, setState] = useState(new SingleRequestState())

  let formattedTitle = "Request URL: "
  formattedTitle += state.truncateTitle ? props.selectedCycle.fullUrl.clippedTo(32) : props.selectedCycle.fullUrl

  const onMouseHoverTitle = (hover: boolean) => {
    setState({ ...state, truncateTitle: !hover })
  }

  const segmentItems = ["General Info", "Request", "Response"]

  const segmentSelectionHandler = (selectedIndex: number) => {
    setState({
      ...state, selectedSegmentIndex: selectedIndex
    })
  }

  return (
    <>
      <div className="ContentColumn">
        <h1 onMouseEnter={() => onMouseHoverTitle(true)} onMouseLeave={() => onMouseHoverTitle(false)}>{formattedTitle}</h1>
        <SingleRequestCardsCollection cycle={props.selectedCycle} />
        <SegmentedControl items={segmentItems} selectionHandler={segmentSelectionHandler} />
        <InformationContainer cycle={props.selectedCycle} selectedIndex={state.selectedSegmentIndex} />
      </div>
    </>
  )
}

const InformationContainer = (props: { cycle: RequestCycle, selectedIndex: number }) => {
  if (props.selectedIndex === 0) { // General Information tab
    return <RequestInfoTable request={props.cycle} />
  } else if (props.selectedIndex === 1) { // Request Tab
    const { cycleId, rawMethod, url, headers, body } = props.cycle.request
    const requestContent = { cycleId, method: rawMethod, path: url, headers, body }
    return <RequestContainer content={requestContent} type={ContentType.request} readOnly={true} />
  } else if (props.selectedIndex === 2) { // Response tab
    if (props.cycle.response === undefined) { return <div className="CenteredContent"><BounceLoader color="#FFF" /></div> }

    const { cycleId, status, statusCode, headers } = props.cycle.response
    const responseContent = { cycleId, status, statusCode, headers }
    return <RequestContainer content={responseContent} type={ContentType.response} readOnly={true} />
  }

  return <></>
}

export default SingleRequestDetails