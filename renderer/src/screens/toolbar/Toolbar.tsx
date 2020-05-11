import React from 'react'

import ToolbarButton from './components/ToolbarButton'

import { ReactComponent as ClearIcon } from '../../resources/assets/toolbar/clear.svg'
import { ReactComponent as FingerprintIcon } from '../../resources/assets/toolbar/fingerprint.svg'
import { ReactComponent as StopIcon } from '../../resources/assets/toolbar/stop.svg'

import './Toolbar.css'

export enum ToolbarAction {
  clear, fingerprintToggled, interceptToggled
}

type ToolbarActionHandler = (action: ToolbarAction) => void

const Toolbar = (props: { isFingerprintEnabled: boolean, isInterceptEnabled: boolean, handler: ToolbarActionHandler }) => {
  const clearComponent = <ClearIcon className="ToolbarButtonIcon" />

  const fingerprintClassName = props.isFingerprintEnabled ? "ToolbarButtonIconEnabled" : "ToolbarButtonIcon"
  const fingerprintComponent = <FingerprintIcon className={fingerprintClassName} />

  const stopClassName = props.isInterceptEnabled ? "ToolbarButtonIconEnabled" : "ToolbarButtonIcon"
  const stopComponent = <StopIcon className={stopClassName} />
  
  return (
    <div className="Toolbar">
      <ToolbarButton icon={clearComponent} style={{ marginLeft: 230 }} onClick={() => props.handler(ToolbarAction.clear)} />
      <ToolbarButton icon={fingerprintComponent} style={{ marginLeft: 50 }} onClick={() => props.handler(ToolbarAction.fingerprintToggled)} />
      <ToolbarButton icon={stopComponent} style={{ marginLeft: 50 }} onClick={() => props.handler(ToolbarAction.interceptToggled)} />
    </div>
  )
}

export default Toolbar