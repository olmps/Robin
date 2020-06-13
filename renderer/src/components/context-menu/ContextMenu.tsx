import React, { useRef, useEffect } from 'react'

import './ContextMenu.css'

type ContextAction = () => void
export interface ContextMenuItem {
  title: string
  action: ContextAction
}

const ContextMenu = (props: { items: ContextMenuItem[], xPosition: number, yPosition: number, dismissHandler: VoidFunction }) => {
  const wrapperRef = useRef(null)

  const style: React.CSSProperties = {
    'top': props.yPosition,
    'left': props.xPosition,
  }

  useEffect(() => {
    document.addEventListener('mousedown', (e) => onMouseEvent(e, wrapperRef, props.dismissHandler))

    return () => {
      document.removeEventListener('mousedown', (e) => onMouseEvent(e, wrapperRef, props.dismissHandler))
    }
  })

  return (
    <div className="ContextMenu" style={style} ref={wrapperRef}>
      {props.items.map(item => <p key={item.title} onClick={() => item.action()} className="Item">{item.title}</p>)}
    </div>
  )
}

function onMouseEvent(event: MouseEvent, wrapperRef: React.RefObject<HTMLDivElement>, dismissHandler: VoidFunction) {
  const targetNode: any = event.target
  
  if (wrapperRef.current && !wrapperRef.current.contains(targetNode)) {
    dismissHandler()
  }
}

export default ContextMenu