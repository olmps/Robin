import React, { useEffect } from 'react'

import './ContextMenu.css'

type ContextAction = () => void
export interface ContextMenuItem {
  title: String
  action: ContextAction
}

const ContextMenu = (props: { items: ContextMenuItem[], xPosition: number, yPosition: number }) => {
  const style: React.CSSProperties = {
    'top': props.yPosition,
    'left': props.xPosition,
  }

  return (
    <div className="ContextMenu" style={style}>
      { props.items.map(item => <p onClick={() => item.action()} className="Item">{item.title}</p>) }
    </div>
  )
}

export default ContextMenu