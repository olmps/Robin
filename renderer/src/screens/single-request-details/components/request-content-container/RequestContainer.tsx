import React from 'react'

import './RequestContainer.css'
import { syntaxHighlighted } from './ContentFormatter'

export const RequestContainer = (props: { title: string, headers: Map<string, string>, body?: string }) => {
  return (
    <div className="ContentWrapper">
      <p className="Title">{props.title}</p>
      { Array.from(props.headers.keys()).map(key => 
          <p key={key} className="Header">
            <span className="Key">{key}:</span> <span className="Content">{props.headers.get(key)}</span>
          </p>
        )
      }
      { props.body ? <pre className="Body">{syntaxHighlighted(props.body)}</pre> : <></> }
    </div>
  )
}

export default RequestContainer