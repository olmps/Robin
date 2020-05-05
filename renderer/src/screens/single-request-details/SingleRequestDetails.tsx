import React, { useState } from 'react'

import { RequestCycle } from '../../models'
import { rawMethod } from '../../models/request'

import { SingleRequestCardsCollection } from '../../components/cards-collection/RequestsCardsCollection'
import SegmentedControl from '../../components/segmented-control/SegmentedControl'
import RequestInfoTable from './components/general-info-table/RequestInfoTable'
import RequestContainer from './components/request-content-container/RequestContainer'

import './SingleRequestDetails.css'
import '../../extensions/string'

class SingleRequestState {
    constructor(public selectedSegmentIndex: number = 0) {}
}

const SingleRequestDetails = (props: { selectedCycle: RequestCycle }) => {
    const [state, setState] = useState(new SingleRequestState())

    const formattedTitle = props.selectedCycle.fullUrl.clippedTo(32)
    const segmentItems = ["General Info", "Request", "Response"]

    const segmentSelectionHandler = (selectedIndex: number) => {
        setState({
            ...state, selectedSegmentIndex: selectedIndex
        })
    }

    return (
        <>
            <div className="ContentColumn">
                <h1>{formattedTitle}</h1>
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
    } else if (props.selectedIndex === 1) {
        const title = `${rawMethod(props.cycle.method)} ${props.cycle.url}`
        return <RequestContainer title={title} headers={props.cycle.request.headers} body={props.cycle.request.body} />
    }
    
    return <></>
}

export default SingleRequestDetails