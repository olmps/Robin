import React, { useState, FunctionComponent } from 'react'

import './SegmentedControl.css'

class SegmentState {
  constructor(public items: string[], public selectedIndex: number) { }
}

interface SegmentProps {
  items: string[]
  selectedIndex?: number
  selectionHandler: SelectionHandler
}

// User internally in the component
type InternalSelectionHandler = (selectedItem: string) => void
// External selection handler
type SelectionHandler = (selectedIndex: number) => void

const SegmentedControl: FunctionComponent<SegmentProps> = (props) => {
  const [segmentState, setSegmentState] = useState(new SegmentState(props.items, props.selectedIndex!))

  const segmentSelectionHandler = (selectedItem: string) => {
    const itemIndex = segmentState.items.indexOf(selectedItem)
    props.selectionHandler(itemIndex)

    setSegmentState({
      ...segmentState, selectedIndex: itemIndex
    })
  }

  return (
    <div className="SegmentedControl">
      { 
        props.items.map((item, index) =>
          index === segmentState.selectedIndex ? 
            <HighlightedSegment key={item} title={item} /> : 
            <NormalSegment key={item} title={item} selectionHandler={segmentSelectionHandler} />
        )
      }
    </div>
  )
}

const HighlightedSegment = (props: { title: string }) => {
  return (
    <div className="HighlightedSegment">
      <h2>{props.title}</h2>
    </div>
  )
}

const NormalSegment = (props: { title: string, selectionHandler: InternalSelectionHandler }) => {
  return (
    <div className="NormalSegment" onClick={() => props.selectionHandler(props.title)}>
      <h2>{props.title}</h2>
    </div>
  )
}

SegmentedControl.defaultProps = { selectedIndex: 0 }
export default SegmentedControl