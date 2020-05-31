import React from 'react'

import './RequestCard.css'

const RequestCard = (props: { icon: JSX.Element, title: string, subtitle: string }) => {
  return (
    <div className="CardWrapper">
      <div className="Card">
        <div className="CardIcon">{props.icon}</div>
        <p className="CardTitle">{props.title}</p>
        <p className="CardSubtitle">{props.subtitle}</p>
      </div>
    </div>
  )
}

export default RequestCard