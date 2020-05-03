import React, { useState } from 'react'

import { RequestCycle } from '../../models'

import { SingleRequestCardsCollection } from '../../components/cards-collection/RequestsCardsCollection'
import SegmentedControl from '../../components/segmented-control/SegmentedControl'
import RequestInfoTable from './components/RequestInfoTable'

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
                <RequestInfoTable request={props.selectedCycle} />
            </div>
        </>
    )
}

export default SingleRequestDetails