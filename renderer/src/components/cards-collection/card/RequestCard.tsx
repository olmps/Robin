import React from 'react'

// Style
import './RequestCard.css'

const RequestCard = ({ iconPath, title, subtitle }: { iconPath: string, title: string, subtitle: string}) => {
    return (
        <div className="CardWrapper">
            <div className="Card">
                <img alt={"Card Icon"} className="CardIcon" src={iconPath}/>
                <p className="CardTitle">{title}</p>
                <p className="CardSubtitle">{subtitle}</p>
            </div>
        </div>
    )
}

export default RequestCard