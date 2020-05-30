import React, { useState } from 'react'

import { DiscloseActionHandler, DiscloseAction } from '../models'

import { ReactComponent as ClearIcon } from '../../../resources/assets/disclosure-list/clear_action_icon.svg'
import { ReactComponent as FoldIcon } from '../../../resources/assets/disclosure-list/fold_action_icon.svg'
import { ReactComponent as FingerprintIcon } from '../../../resources/assets/disclosure-list/fingerprint_action_icon.svg'
import { ReactComponent as InterceptIcon } from '../../../resources/assets/disclosure-list/intercept_action_icon.svg'

import './DisclosureListHeader.css';

class ActionsState {
  constructor(
    public isFingerprintEnabled: boolean = true,
    public isInterceptEnabled: boolean = false) { }
}

const DisclosureListHeader = (props: { actionHandler: DiscloseActionHandler }) => {
  const searchHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    props.actionHandler(DiscloseAction.search, event.target.value)
  }

  return (
    <div className="DisclosureListHeader">
      <input className="FilterTextField" placeholder="Filter" type="text" onChange={(e) => searchHandler(e)} />
      <RequestsActions actionHandler={props.actionHandler} />
    </div>
  )
}

const RequestsActions = (props: { actionHandler: DiscloseActionHandler }) => {
  const [state, setState] = useState(new ActionsState())

  const fingerprintClassName = state.isFingerprintEnabled ? "ActionButton Enabled" : "ActionButton"
  const interceptClassName = state.isInterceptEnabled ? "ActionButton Enabled" : "ActionButton"

  const actionHandler = (action: DiscloseAction) => {
    if (action === DiscloseAction.fingerprint) {
      setState({ ...state, isFingerprintEnabled: !state.isFingerprintEnabled })
    } else if (action === DiscloseAction.intercept) {
      setState({ ...state, isInterceptEnabled: !state.isInterceptEnabled })
    }
    
    props.actionHandler(action, undefined)
  }

  return (
    <div className="RequestsActions">
      <p className="RequestTitle">REQUESTS</p>
      <div className="RequestsActionsRow">
        <button title="Intercept Requests" className={interceptClassName} onClick={() => actionHandler(DiscloseAction.intercept)}><InterceptIcon className="ActionIcon" /></button>
        <button title="Record Requests" className={fingerprintClassName} onClick={() => actionHandler(DiscloseAction.fingerprint)}><FingerprintIcon className="ActionIcon" /></button>
        <button title="Fold Requests" className="ActionButton" onClick={() => actionHandler(DiscloseAction.fold)}><FoldIcon className="ActionIcon" /></button>
        <button title="Clear Requests" className="ActionButton" onClick={() => actionHandler(DiscloseAction.clear)}><ClearIcon className="ActionIcon" /></button>
      </div>
    </div>
  )
}

export default DisclosureListHeader
