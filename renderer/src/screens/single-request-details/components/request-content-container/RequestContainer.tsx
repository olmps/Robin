import React from 'react'

import './RequestContainer.css'
import { syntaxHighlighted } from './ContentFormatter'

export const RequestContainer = (props: { title: string, headers: Map<string, string>, body?: string }) => {
  return (
    <div className="ContentWrapper">
      <div className="line"><p className="Title">{props.title}</p></div>
      { Array.from(props.headers.keys()).map(key => 
          <div key={key} className="line">
            <p key={key} className="Header">
              <span className="Key">{key}:</span> <span className="Content">{props.headers.get(key)}</span>
            </p>
          </div>
        )
      }
      <div className="line">{ props.body ? <pre className="Body">{syntaxHighlighted(props.body)}</pre> : <></> }</div>
    </div>
  )
}

export default RequestContainer