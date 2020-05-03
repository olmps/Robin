import React from 'react'

// Models
import { RequestCycle } from '../../models'

// Components
import { SingleRequestCardsCollection } from '../../components/cards-collection/RequestsCardsCollection'

// Style
import './SingleRequestDetails.css'

const SingleRequestDetails = ({ selectedCycle }: { selectedCycle: RequestCycle }) => {
    return (
        <>
            <div className="ContentColumn">
                <h1>{selectedCycle.fullUrl.substring(24)}</h1>
                <SingleRequestCardsCollection cycle={selectedCycle} />
            </div>
        </>
    )
}

export default SingleRequestDetails