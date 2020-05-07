import React from 'react'

import './ToolbarButton.css'

const ToolbarButton = (props: { icon: JSX.Element, style: React.CSSProperties, onClick: (() => void) }) => {
  return (
    <button style={props.style} className="ToolbarButton" onClick={() => props.onClick()}>
      {props.icon}
    </button>
  )
}

export default ToolbarButton