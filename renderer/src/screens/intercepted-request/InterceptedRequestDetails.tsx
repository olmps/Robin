import React, { useState } from 'react'

import { Request, Response } from '../../models'

import RequestContainer from '../components/request-content-container/RequestContainer'
import { InterceptResult, InterceptAction, ContentType, AnyContent } from '../../shared/modules'

import './InterceptedRequestDetails.css'
import '../../extensions/string'

class InterceptedState {
  constructor(public updatedContent: AnyContent) { }
}

type SetInterceptState = React.Dispatch<React.SetStateAction<InterceptedState>>

const InterceptedRequestDetails = (props: { content: AnyContent, handler: InterceptResult }) => {
  const contentType: ContentType = 'method' in props.content ? ContentType.request : ContentType.response
  
  const [state, setState] = useState(new InterceptedState(props.content))

  const formattedTitle = contentType === ContentType.request ? "Intercepted Request" : "Intercepted Response"

  const actionHandler = (action: InterceptAction) => {
    props.handler(action, contentType, state.updatedContent)
  }

  return (
    <>
      <div className="ContentColumn">
        <h1>{formattedTitle}</h1>
        <InformationContainer content={props.content} type={contentType} setState={setState} />
        <div className="ButtonsContainer">
          <button onClick={() => actionHandler(InterceptAction.send)} className="SendButton">SEND</button>
        </div>
      </div>
    </>
  )
}

const InformationContainer = (props: { content: AnyContent, type: ContentType, setState: SetInterceptState }) => {
  switch (props.type) {
    case ContentType.request:
      const requestHandler = (updatedContent: AnyContent) => { requestUpdateHandler(updatedContent, props.setState) }
      return <RequestContainer content={props.content} type={props.type} readOnly={false} handler={requestHandler} />
    case ContentType.response:
      const responseHandler = (updatedContent: AnyContent) => { responseUpdateHandler(updatedContent, props.setState) }
      return <RequestContainer content={props.content} type={props.type} readOnly={false} handler={responseHandler} />
  }
}

function requestUpdateHandler(updatedContent: AnyContent, setState: SetInterceptState) {
  setState(state => {
    return { ...state, updatedContent }
  })
}

function responseUpdateHandler(updatedContent: AnyContent, setState: SetInterceptState) {
  setState(state => {
    return { ...state, updatedContent }
  })
}

export default InterceptedRequestDetails
export { InterceptAction }