import React from 'react'

import ToolbarButton from './components/ToolbarButton'

import { ReactComponent as ClearIcon } from '../../resources/assets/toolbar/clear.svg'
import { ReactComponent as FingerprintIcon } from '../../resources/assets/toolbar/fingerprint.svg'

import './Toolbar.css'

export enum ToolbarAction {
  clear, fingerprintToggled
}

type ToolbarActionHandler = (action: ToolbarAction) => void

const Toolbar = (props: { isFingerprintEnabled: boolean, handler: ToolbarActionHandler }) => {
  const clearComponent = <ClearIcon className="ToolbarButtonIcon" />

  const fingerprintClassName = props.isFingerprintEnabled ? "ToolbarFingerprintEnabled" : "ToolbarButtonIcon"
  const fingerprintComponent = <FingerprintIcon className={fingerprintClassName} />
  
  return (
    <div className="Toolbar">
      <ToolbarButton icon={clearComponent} style={{ marginLeft: 230 }} onClick={() => props.handler(ToolbarAction.clear)} />
      <ToolbarButton icon={fingerprintComponent} style={{ marginLeft: 50 }} onClick={() => props.handler(ToolbarAction.fingerprintToggled)} />
    </div>
  )
}

export default Toolbar