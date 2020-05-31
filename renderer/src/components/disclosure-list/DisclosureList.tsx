import React, { useState, useEffect, useRef } from 'react'

import { setupTransientItems, Action, onKeyboardInput, KeyAction } from './DisclosureListActions'

import { DisclosureListModel, DisclosureItemModel, DiscloseAction, DiscloseActionHandler } from './models'

import { ReactComponent as WebsiteIcon } from '../../resources/assets/disclosure-list/website_icon.svg'
import { ReactComponent as SecureWebsiteIcon } from '../../resources/assets/disclosure-list/secure_website_icon.svg'
import { ReactComponent as FolderIcon } from '../../resources/assets/disclosure-list/folder_icon.svg'
import { ReactComponent as FileIcon } from '../../resources/assets/disclosure-list/file_icon.svg'
import { ReactComponent as BlockedIcon } from '../../resources/assets/disclosure-list/drop_request_icon.svg'
import { ReactComponent as LoadingIcon } from '../../resources/assets/requests-details/stats/sync.svg'

import './DisclosureList.css'
import DisclosureListHeader from './header/DisclosureListHeader'

class DisclosureListState {
  constructor(public selectedItemKey: string = "",
              public openItemsKeys: string[] = []) { }
}

export const DisclosureList = (props: { list: DisclosureListModel, actionHandler: DiscloseActionHandler }) => {
  const [listState, setListState] = useState(new DisclosureListState())

  setupTransientItems(props.list, listState.selectedItemKey, listState.openItemsKeys)

  const itemAction = (action: Action, itemKey: string) => {
    switch (action) {
      case Action.setSelected:
        if (itemKey === "") {
          props.actionHandler(DiscloseAction.select, ["", []])
          setListState({ ...listState, selectedItemKey: "" })
          return
        }
        const selectedItem = props.list.getItem(itemKey)!
        // TODO: MAYBE REMOVE THIS `underneathOriginalRequestKeys` SOMEHOW
        const underneathRequestsKeys = selectedItem.underneathOriginalRequestKeys()
        props.actionHandler(DiscloseAction.select, [selectedItem.originalRequestKey, underneathRequestsKeys])
        setListState({ ...listState, selectedItemKey: itemKey })
        break
      case Action.toggleVisibility:
        const openItems = listState.openItemsKeys
        const openKeyIndex = openItems.indexOf(itemKey)
        if (openKeyIndex !== -1) { delete openItems[openKeyIndex] }
        else { openItems.push(itemKey) }
        setListState({ ...listState, openItemsKeys: openItems })
        break
      default: break
    }
  }

  const onKeyboardKeyDown = (event: Event) => {
    const keyboardEvent = event as KeyboardEvent
    const item = props.list.getItem(listState.selectedItemKey)
    if (item) {
      item.isSelected = listState.selectedItemKey === item.key
      item.isOpen = listState.openItemsKeys.indexOf(item.key) !== -1
      onKeyboardInput(keyboardEvent, item, listState.openItemsKeys, itemAction, props.list)
    }
  }

  const onTapOutside = (event: MouseEvent) => {
    if (!wrapperRef.current) { return }
    const targetNode: any = event.target

    // Detects a tap on the RequestsSidebar but not on the list component. The expected behavior is to unselect
    // the selected item.
    if (!wrapperRef.current.contains(targetNode) && targetNode.className === "RequestsSidebar") {
      props.actionHandler(DiscloseAction.select, ["", []])
      setListState({ ...listState, selectedItemKey: "" })
    }
  }

  const headerActionHandler = (action: DiscloseAction, content: any | undefined) => {
    switch (action) {
      // Fold is the only action handled by the list component. Other actions depends from parent's information
      case DiscloseAction.fold:
        setListState({ ...listState, openItemsKeys: [] })
        break
      default:
        props.actionHandler(action, content)
    }
  }

  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    document.addEventListener("keydown", onKeyboardKeyDown)
    document.addEventListener('mousedown', onTapOutside)

    return () => {
      document.removeEventListener('keydown', onKeyboardKeyDown)
      document.removeEventListener('mousedown', onTapOutside)
    }
  })

  return (
    <div ref={wrapperRef} >
      <DisclosureListHeader actionHandler={headerActionHandler} />
      <RecursiveDisclosureList items={props.list.items} actionHandler={itemAction} />
    </div>
  )
}

const RecursiveDisclosureList = (props: { items: DisclosureItemModel[], actionHandler: KeyAction }) => {
  return (
    <>
      {props.items.map(item => <RecursiveDisclosureItem key={item.key} item={item} actionHandler={props.actionHandler} />)}
    </>
  )
}

const RecursiveDisclosureItem = (props: { item: DisclosureItemModel, actionHandler: KeyAction }) => {
  if (props.item.hasSubItems && props.item.isOpen) {
    return (
      <div className="ListItem">
        <DisclosureItem item={props.item}
          actionHandler={props.actionHandler} />
        <ul>
          <RecursiveDisclosureList items={props.item.subItems} actionHandler={props.actionHandler} />
        </ul>
      </div>
    )
  }

  return <DisclosureItem item={props.item} actionHandler={props.actionHandler} />
}

const DisclosureItem = (props: { item: DisclosureItemModel, actionHandler: KeyAction }) => {
  if (props.item.hasSubItems) {
    let icon: JSX.Element
    if (props.item.isRoot) {
      if (props.item.isSecure) {
        icon = props.item.isSelected ? <SecureWebsiteIcon className="Icon SelectedIcon" /> : <SecureWebsiteIcon className="Icon" />
      } else {
        icon = props.item.isSelected ? <WebsiteIcon className="Icon SelectedIcon" /> : <WebsiteIcon className="Icon" />
      }
    } else {
      icon = props.item.isSelected ? <FolderIcon className="Icon SelectedIcon" /> : <FolderIcon className="Icon" />
    }

    return (
      <div className="SingleListItem">
        <ToggleDisclosureItem item={props.item}
          icon={icon}
          actionHandler={props.actionHandler}
        />
      </div>
    )
  }

  return (
    <div className="SingleListItem">
      <LeafItem item={props.item} actionHandler={props.actionHandler} />
    </div>
  )
}

/**
 * Behaves exactly like HTML <details> tag but it only discloses when tapping on the disclose icon
 */
const ToggleDisclosureItem = (props: { item: DisclosureItemModel, icon: JSX.Element, actionHandler: KeyAction }) => {
  const visibilityHandler = (event: React.MouseEvent) => {
    props.actionHandler(Action.toggleVisibility, props.item.key)
    event.stopPropagation()
  }
  const selectionHandler = (event: React.MouseEvent) => {
    // CMD + Click deselect the item
    if (props.item.isSelected && event.metaKey) {
      props.actionHandler(Action.setSelected, "")
    } else if (!props.item.isSelected) {
      props.actionHandler(Action.setSelected, props.item.key)
    }
  }

  const selectedDisclosureIconColor = props.item.isSelected ? props.item.isOpen ? { borderTopColor: '#FFF' } : { borderLeftColor: '#FFF' } : {}
  const buttonClass = props.item.isOpen ? "DiscloseArrow OpenArrow" : "DiscloseArrow ClosedArrow"

  let className = "DiscloseFinalItem"
  if (props.item.isSelected) {
    className += " SelectedItem"
  } else if (props.item.isHighlighted) {
    className += " HighlightedItem"
  }

  return (
    <div className={className} onClick={(e) => selectionHandler(e)}>
      <button className={buttonClass} style={selectedDisclosureIconColor} onClick={(e) => visibilityHandler(e)} />
      {props.icon}
      {props.item.label}
    </div>
  )
}

/**
 * Represents a list item that has no subitems - like a three leaf.
 */
const LeafItem = (props: { item: DisclosureItemModel, actionHandler: KeyAction }) => {
  const selectionHandler = (event: React.MouseEvent) => {
    // CMD + Click deselect the item
    if (props.item.isSelected && event.metaKey) {
      props.actionHandler(Action.setSelected, "")
    } else if (!props.item.isSelected) {
      props.actionHandler(Action.setSelected, props.item.key)
    }
  }

  let className = "LeafSingleListItem"
  if (props.item.isSelected) { className += " SelectedItem" }

  let iconClassName = "Icon"
  if (props.item.isSelected) { iconClassName += " SelectedIcon" }

  return (
    <div className={className} onClick={(e) => selectionHandler(e)}>
      {props.item.isBlocked ? 
        <BlockedIcon className="Icon Blocked" /> :
        props.item.isLoading ?
        <LoadingIcon className="Icon" /> :
        <FileIcon className={iconClassName} />}
      {props.item.label}
    </div>
  )
}