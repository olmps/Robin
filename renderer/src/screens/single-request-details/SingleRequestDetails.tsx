import React, { useState } from 'react'

// Models
import { RequestCycle } from '../../models'

// Components
import { SingleRequestCardsCollection } from '../../components/cards-collection/RequestsCardsCollection'
import SegmentedControl from '../../components/segmented-control/SegmentedControl'

// Style
import './SingleRequestDetails.css'

class SingleRequestState {
    constructor(public selectedSegmentIndex: number = 0) {}
}

const SingleRequestDetails = (props: { selectedCycle: RequestCycle }) => {
    const [state, setState] = useState(new SingleRequestState())

    const formattedTitle = props.selectedCycle.fullUrl.length > 32 ? `${props.selectedCycle.fullUrl.substring(0, 32)}...` : props.selectedCycle.fullUrl
    const segmentItems = ["General Info", "Request", "Response"]

    const segmentSelectionHandler = (selectedIndex: number) => {
        console.log("Did select index " + selectedIndex)
    }

    return (
        <>
            <div className="ContentColumn">
                <h1>{formattedTitle}</h1>
                <SingleRequestCardsCollection cycle={props.selectedCycle} />
                <SegmentedControl items={segmentItems} selectionHandler={segmentSelectionHandler} />
            </div>
        </>
    )
}

export default SingleRequestDetails