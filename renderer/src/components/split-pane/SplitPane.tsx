import React, { useState } from 'react'

import './SplitPane.css'

class SplitPaneState {
  constructor(
    public currentWidth: number,
    public minWidth: number,
    public maxWidth: number,
    // Control properties
    public isDragging: boolean = false,
    public lastX: number = 0) { }
}

type SplitPaneProps = { initialWidth: number, minWidth: number, maxWidth: number }
type SetSplitPaneState = React.Dispatch<React.SetStateAction<SplitPaneState>>

/**
 * Creates a SplitPane that resizes - shrink and expand - the *first element* when the resizer is dragged
 * 
 * IMPORTANT: It only supports two elements, which are our today use-case. It can be easily refactored to support
 * multiple "panes" if necessary in the future
 */
const SplitPane = (props: React.PropsWithChildren<SplitPaneProps>) => {
  const [state, setState] = useState(new SplitPaneState(props.initialWidth, props.minWidth, props.maxWidth))

  const childrenPanes = React.Children.toArray(props.children)

  return (
    <div className="SplitPane" onMouseMove={(e) => onResizerMove(e, state, setState)} onMouseUp={(e) => onResizerMouseUp(e, state, setState)}>
      <div style={{ width: state.currentWidth, overflow: 'scroll' }}>{childrenPanes[0]}</div>
      <div className="Resizer" onMouseDown={(e) => onResizerMouseDown(e, setState)} />
      {childrenPanes[1]}
    </div>
  )
}

function onResizerMouseDown(event: React.MouseEvent, setState: SetSplitPaneState) {
  // Avoid undesired elements selection while dragging the resizer
  event.stopPropagation()
  event.preventDefault()
  event.nativeEvent.stopImmediatePropagation()

  // Must be destructured outside due to React events reusage.
  // See: https://stackoverflow.com/questions/49500255/warning-this-synthetic-event-is-reused-for-performance-reasons-happening-with
  const { clientX } = event
  
  setState(state => {
    return { ...state, isDragging: true, lastX: clientX }
  })
}

function onResizerMove(event: React.MouseEvent, state: SplitPaneState, setState: SetSplitPaneState) {
  if (state.isDragging) {
    // Avoid undesired elements selection while dragging the resizer
    event.stopPropagation()
    event.preventDefault()
    event.nativeEvent.stopImmediatePropagation()

    const { clientX } = event
    const delta = clientX - state.lastX

    let newSidebarWidth = Math.max(state.currentWidth + delta, state.minWidth)
    newSidebarWidth = Math.min(newSidebarWidth, state.maxWidth)

    setState(state => {
      return { ...state, currentWidth: newSidebarWidth, lastX: clientX }
    })
  }
}

function onResizerMouseUp(event: React.MouseEvent, state: SplitPaneState, setState: SetSplitPaneState) {
  if (state.isDragging) {
    // Avoid undesired elements selection while dragging the resizer
    event.stopPropagation()
    event.preventDefault()
    event.nativeEvent.stopImmediatePropagation()
  }

  setState(state => {
    return { ...state, isDragging: false }
  })
}

export default SplitPane