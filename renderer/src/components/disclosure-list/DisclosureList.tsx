import React, { useState, useEffect, useRef } from 'react'

import { setupTransientProperties, ItemAction, ItemActionHandler, onKeyboardInput, ContextMenuData } from './DisclosureListHelpers'

import { DisclosureListModel, DiscloseAction, DiscloseActionHandler } from './models'

import DisclosureListHeader from './header/DisclosureListHeader'
import ContextMenu from '../context-menu/ContextMenu'
import { RecursiveDisclosureList } from './DisclosureListElements'

class DisclosureListState {
  constructor(
    public selectedItemKey: string = "",
    public openItemsKeys: string[] = [],
    public contextMenuData: ContextMenuData | undefined = undefined) { }
}

type SetListState = React.Dispatch<React.SetStateAction<DisclosureListState>>

export const DisclosureList = (props: { list: DisclosureListModel, actionHandler: DiscloseActionHandler }) => {
  const [listState, setListState] = useState(new DisclosureListState())
  const wrapperRef = useRef<HTMLDivElement>(null)

  setupTransientProperties(props.list, listState.selectedItemKey, listState.openItemsKeys)

  // Handle list items actions (selection, visibility, etc)
  const itemActionHandler = (action: ItemAction, content: any) => onItemAction(action, content, props.list, props.actionHandler, setListState)
  // Handles keyboard events on the list (arrow navigation for example)
  const keyboardEventHandler = (event: Event) => onKeyboardEvent(event, props.list, listState, itemActionHandler)
  // Handle mouse events inside and outside the component
  const mouseEventHandler = (event: MouseEvent) => onMouseEvent(event, wrapperRef, props.actionHandler, setListState)

  // Handle header action buttons interactions
  const headerActionHandler = (action: DiscloseAction, content: any | undefined) => {
    switch (action) {
      // Fold is the only action handled internally by the list component.
      // Other actions are forwarded to parent components to be correctly handled
      case DiscloseAction.fold:
        setListState({ ...listState, openItemsKeys: [] })
        break
      default:
        props.actionHandler(action, content)
    }
  }

  useEffect(() => {
    document.addEventListener("keydown", keyboardEventHandler)
    document.addEventListener('mousedown', mouseEventHandler)

    return () => {
      document.removeEventListener('keydown', keyboardEventHandler)
      document.removeEventListener('mousedown', mouseEventHandler)
    }
  })

  return (
    <div ref={wrapperRef} >
      <DisclosureListHeader actionHandler={headerActionHandler} />
      <RecursiveDisclosureList items={props.list.items} actionHandler={itemActionHandler} />
      {listState.contextMenuData !== undefined ?
        <ContextMenu items={[]} xPosition={listState.contextMenuData!.clientX} yPosition={listState.contextMenuData!.clientY} /> :
        <></>}
    </div>
  )
}

/*
  Handle actions executed on the list items.
  
  These can be: selection, disclose visibility tapped, right clicked tapped, etc.
*/
function onItemAction(action: ItemAction, content: any, list: DisclosureListModel, actionHandler: DiscloseActionHandler, setState: SetListState) {
  switch (action) {
    case ItemAction.setSelected: {
      const itemKey = content as string
      // Means a previously selected item was deselected.
      if (itemKey === "") {
        actionHandler(DiscloseAction.select, ["", []])
        setState(state => { return { ...state, selectedItemKey: "" } })
        return
      }
      // Otherwise, we must het the item
      const selectedItem = list.getItem(itemKey)!
      // TODO: MAYBE REMOVE THIS `underneathOriginalRequestKeys` SOMEHOW
      const underneathRequestsKeys = selectedItem.underneathOriginalRequestKeys()
      actionHandler(DiscloseAction.select, [selectedItem.originalRequestKey, underneathRequestsKeys])
      setState(state => { return { ...state, selectedItemKey: itemKey } })
      break
    }
    case ItemAction.toggleVisibility: {
      const itemKey = content as string
      setState(state => {
        const openItems = state.openItemsKeys
        const openKeyIndex = openItems.indexOf(itemKey)
        if (openKeyIndex !== -1) { delete openItems[openKeyIndex] }
        else { openItems.push(itemKey) }
        return { ...state, openItemsKeys: openItems }
      })
      break
    }
    case ItemAction.rightClick: {
      const data = content as ContextMenuData
      setState(state => { return { ...state, selectedItemKey: data.itemKey, contextMenuData: data } })
      break
    }
    default: break
  }
}

/**
 * Handle keyboard events, such as navigating through the list using arrow up and arrow down,
 * open and close disclose items using left and right arrow, etc.
 */
function onKeyboardEvent(event: Event, list: DisclosureListModel, listState: DisclosureListState, actionHandler: ItemActionHandler) {
  const keyboardEvent = event as KeyboardEvent
  const item = list.getItem(listState.selectedItemKey)
  if (item) {
    item.isSelected = listState.selectedItemKey === item.key
    item.isOpen = listState.openItemsKeys.indexOf(item.key) !== -1
    onKeyboardInput(keyboardEvent, item, listState.openItemsKeys, actionHandler, list)
  }
}

/**
 * Handle mouse events inside and outside the component
 */
function onMouseEvent(event: MouseEvent, wrapperRef: React.RefObject<HTMLDivElement>, actionHandler: DiscloseActionHandler, setState: SetListState) {
  if (!wrapperRef.current) { return }
  const targetNode: any = event.target

  // Detects a tap on the RequestsSidebar but not on the list component. The expected behavior is to unselect
  // the current selected item - if it exists.
  if (!wrapperRef.current.contains(targetNode) && targetNode.className === "RequestsSidebar") {
    actionHandler(DiscloseAction.select, ["", []])
    setState(state => { return { ...state, selectedItemKey: "" } })
  }
}