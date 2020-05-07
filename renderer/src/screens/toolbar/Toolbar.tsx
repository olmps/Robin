import React from 'react'

import ToolbarButton from './components/ToolbarButton'

import clearButton from '../../resources/assets/toolbar/clear.svg'

import './Toolbar.css'

export enum ToolbarAction {
  clear
}

type ToolbarActionHandler = (action: ToolbarAction) => void

const Toolbar = (props: { handler: ToolbarActionHandler }) => {
  return (
    <div className="Toolbar">
      <ToolbarButton imagePath={clearButton} style={{ marginLeft: 230 }} onClick={() => props.handler(ToolbarAction.clear)} />
    </div>
  )
}

export default Toolbar