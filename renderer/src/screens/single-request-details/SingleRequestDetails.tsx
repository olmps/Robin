import React from 'react'

// Models
import { RequestCycle } from '../../models'

// Components
import { SingleRequestCardsCollection } from '../../components/cards-collection/RequestsCardsCollection'

// Style
import './SingleRequestDetails.css'

const SingleRequestDetails = ({ selectedCycle }: { selectedCycle: RequestCycle }) => {
    const formattedTitle = selectedCycle.fullUrl.length > 32 ? `${selectedCycle.fullUrl.substring(0, 32)}...` : selectedCycle.fullUrl

    return (
        <>
            <div className="ContentColumn">
                <h1>{formattedTitle}</h1>
                <SingleRequestCardsCollection cycle={selectedCycle} />
            </div>
        </>
    )
}

export default SingleRequestDetails