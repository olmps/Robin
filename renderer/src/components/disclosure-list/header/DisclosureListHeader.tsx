import React from 'react'

import { DiscloseActionHandler, DiscloseAction } from '../models'

import { ReactComponent as ClearIcon } from '../../../resources/assets/disclosure-list/clear_action_icon.svg'
import { ReactComponent as FoldIcon } from '../../../resources/assets/disclosure-list/fold_action_icon.svg'

import './DisclosureListHeader.css';

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
  return (
    <div className="RequestsActions">
      <p className="RequestTitle">REQUESTS</p>
      <div>
        <button className="ActionButton" onClick={() => props.actionHandler(DiscloseAction.clear, undefined)}><ClearIcon className="ActionIcon" /></button>
        <button className="ActionButton" onClick={() => props.actionHandler(DiscloseAction.fold, undefined)}><FoldIcon className="ActionIcon" /></button>
      </div>
    </div>
  )
}

export default DisclosureListHeader
