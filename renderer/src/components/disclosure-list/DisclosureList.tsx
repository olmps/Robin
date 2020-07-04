import React, { useState, useEffect, useRef } from 'react'

import { setupTransientProperties, contextMenuDataSource, ItemAction, ItemActionHandler, onKeyboardInput, ContextMenuData, ContextAction } from './DisclosureListHelpers'

import { DisclosureListModel, DiscloseAction, DiscloseActionHandler, DisclosureItemModel } from './models'

import DisclosureListHeader from './header/DisclosureListHeader'
import ContextMenu from '../context-menu/ContextMenu'
import { RecursiveDisclosureList } from './DisclosureListElements'

import './DisclosureList.css'

class DisclosureListState {
  constructor(
    public selectedItemKey: string = "",
    public openItemsKeys: string[] = [],
    public focusedPaths: string[] = [],
    public contextMenuData: ContextMenuData | undefined = undefined) { }
}

type SetListState = React.Dispatch<React.SetStateAction<DisclosureListState>>

export const DisclosureList = (props: { list: DisclosureListModel, actionHandler: DiscloseActionHandler }) => {
  const [listState, setListState] = useState(new DisclosureListState())

  const wrapperRef = useRef<HTMLDivElement>(null)

  setupTransientProperties(props.list, listState.selectedItemKey, listState.openItemsKeys, listState.focusedPaths)

  // Handle list items actions (selection, visibility, etc)
  const itemActionHandler = (action: ItemAction, content: any) => onItemAction(action, content, props.list, props.actionHandler, setListState)
  // Handles keyboard events on the list (arrow navigation for example)
  const keyboardEventHandler = (event: Event) => onKeyboardEvent(event, props.list, listState, itemActionHandler)
  // Handle mouse events inside and outside the component
  const mouseEventHandler = (event: MouseEvent) => onMouseEvent(event, wrapperRef, props.actionHandler, setListState)
  // Handle context menu action on a specific item
  const contextMenuActionHandler = (action: ContextAction) => onContextMenuAction(action, listState.contextMenuData!.item, setListState, props.actionHandler)
  // Handle header actions
  const headerActionHandler = (action: DiscloseAction, content: any | undefined) => onHeaderAction(action, content, setListState, props.actionHandler)
  // Dismiss Context Menu
  const dismissContextMenu = () => { setListState({ ...listState, contextMenuData: undefined }) }

  useEffect(() => {
    document.addEventListener("keydown", keyboardEventHandler)
    document.addEventListener('mousedown', mouseEventHandler)

    return () => {
      document.removeEventListener('keydown', keyboardEventHandler)
      document.removeEventListener('mousedown', mouseEventHandler)
    }
  })

  const hasFocusedItems = listState.focusedPaths.length > 0

  return (
    <div ref={wrapperRef} >
      <DisclosureListHeader actionHandler={headerActionHandler} />

      { hasFocusedItems ? 
          <SplitList items={props.list.items} actionHandler={itemActionHandler} /> :
          <div className="HorizontallScrollable">
            <RecursiveDisclosureList items={props.list.items} actionHandler={itemActionHandler} />
          </div>
      }
      
      {listState.contextMenuData !== undefined ?
        <ContextMenu items={contextMenuDataSource(listState.contextMenuData!.item, contextMenuActionHandler)}
          xPosition={listState.contextMenuData!.clientX}
          yPosition={listState.contextMenuData!.clientY}
          dismissHandler={dismissContextMenu} /> : <></>
      }
    </div>
  )
}

/// Splits the list into focused and unfocused items
const SplitList = (props: { items: DisclosureItemModel[], actionHandler: ItemActionHandler }) => {
  const focusedItems = props.items.filter(item => item.isFocused)
  const unfocusedItems = props.items.filter(item => !item.isFocused)

  return (
    <div className="HorizontallScrollable">
      <p className="Title">Focused</p>
      <RecursiveDisclosureList items={focusedItems} actionHandler={props.actionHandler} />
      <p className="Title">Others</p>
      <RecursiveDisclosureList items={unfocusedItems} actionHandler={props.actionHandler} />
    </div>
  )
}

/// Handle actions executed on the list items.
/// These can be: selection, disclose visibility tapped, right clicked tapped, etc.
function onItemAction(action: ItemAction, content: any, list: DisclosureListModel, actionHandler: DiscloseActionHandler, setState: SetListState) {
  switch (action) {
    case ItemAction.setSelected: {
      const itemKey = content as string
      // Means a previously selected item was deselected.
      if (itemKey === "") {
        actionHandler(DiscloseAction.select, ["", ""])
        setState(state => { return { ...state, selectedItemKey: "" } })
        return
      }
      // Otherwise, we must het the item
      const selectedItem = list.getItem(itemKey)!
      actionHandler(DiscloseAction.select, [selectedItem.originalRequestKey, selectedItem.path])
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
      setState(state => { return { ...state, selectedItemKey: data.item.key, contextMenuData: data } })
      break
    }
    default: break
  }
}

/// Handle keyboard events, such as navigating through the list using arrow up and arrow down,
/// open and close disclose items using left and right arrow, etc.
function onKeyboardEvent(event: Event, list: DisclosureListModel, listState: DisclosureListState, actionHandler: ItemActionHandler) {
  const keyboardEvent = event as KeyboardEvent
  const item = list.getItem(listState.selectedItemKey)
  if (item) {
    item.isSelected = listState.selectedItemKey === item.key
    item.isOpen = listState.openItemsKeys.indexOf(item.key) !== -1
    onKeyboardInput(keyboardEvent, item, listState.openItemsKeys, actionHandler, list)
  }
}

/// Handle mouse events inside and outside the component
function onMouseEvent(event: MouseEvent, 
                      listWrapperRef: React.RefObject<HTMLDivElement>,
                      actionHandler: DiscloseActionHandler, setState: SetListState) {
  const targetNode: any = event.target

  // Detects a tap on the RequestsSidebar but not on the list component. The expected behavior is to unselect
  // the current selected item - if it exists.
  if (!listWrapperRef.current?.contains(targetNode) && targetNode.className === "RequestsSidebar") {
    actionHandler(DiscloseAction.select, ["", ""])
    setState(state => { return { ...state, selectedItemKey: "" } })
  }
}

// Handle context menu actions
function onContextMenuAction(action: ContextAction, item: DisclosureItemModel, setState: SetListState, actionHandler: DiscloseActionHandler) {
  switch (action) {
    case ContextAction.focus:
      setState(state => {
        const focusedPaths = state.focusedPaths
        if (focusedPaths.includes(item.path)) {
          const index = focusedPaths.indexOf(item.path)
          focusedPaths.splice(index, 1)
        } else {
          focusedPaths.push(item.path)
        }
        return { ...state, contextMenuData: undefined, focusedPaths: focusedPaths }
      })
      break
    case ContextAction.intercept:
      actionHandler(DiscloseAction.interceptPath, item.path)
      setState(state => { return { ...state, contextMenuData: undefined } })
      break
    default:
      break
  }
}

/// Handle Header actions
function onHeaderAction(action: DiscloseAction, content: any | undefined, setState: SetListState, actionHandler: DiscloseActionHandler) {
  switch (action) {
    // Fold is the only action handled internally by the list component.
    // Other actions are forwarded to parent components to be correctly handled
    case DiscloseAction.fold:
      setState(state => { return { ...state, openItemsKeys: [] } })
      break
    default:
      actionHandler(action, content)
  }
}