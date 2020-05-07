import React from 'react'

import './ToolbarButton.css'

const ToolbarButton = (props: { imagePath: string, style: React.CSSProperties, onClick: (() => void) }) => {
  return (
    <button style={props.style} className="ToolbarButton" onClick={() => props.onClick()}>
      <img src={props.imagePath}/>
    </button>
  )
}

export default ToolbarButton