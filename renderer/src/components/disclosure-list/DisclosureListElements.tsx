import React from 'react'

import { DisclosureItemModel } from './models'

import { ItemAction, ItemActionHandler, ContextMenuData } from './DisclosureListHelpers'

import { ReactComponent as WebsiteIcon } from '../../resources/assets/disclosure-list/website_icon.svg'
import { ReactComponent as SecureWebsiteIcon } from '../../resources/assets/disclosure-list/secure_website_icon.svg'
import { ReactComponent as FolderIcon } from '../../resources/assets/disclosure-list/folder_icon.svg'
import { ReactComponent as FileIcon } from '../../resources/assets/disclosure-list/file_icon.svg'
import { ReactComponent as BlockedIcon } from '../../resources/assets/disclosure-list/drop_request_icon.svg'
import { ReactComponent as LoadingIcon } from '../../resources/assets/requests-details/stats/sync.svg'

import './DisclosureListElements.css'

export const RecursiveDisclosureList = (props: { items: DisclosureItemModel[], actionHandler: ItemActionHandler }) => {
  return (
    <>
      {props.items.map(item => <RecursiveDisclosureItem key={item.key} item={item} actionHandler={props.actionHandler} />)}
    </>
  )
}

export const RecursiveDisclosureItem = (props: { item: DisclosureItemModel, actionHandler: ItemActionHandler }) => {
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

export const DisclosureItem = (props: { item: DisclosureItemModel, actionHandler: ItemActionHandler }) => {
  
  const contextMenuHandler = (event: React.MouseEvent) => {
    const contextMenuData: ContextMenuData = { item: props.item, path: props.item.path, clientX: event.clientX, clientY: event.clientY }
    props.actionHandler(ItemAction.rightClick, contextMenuData)
    event.preventDefault()
    event.stopPropagation()
  }

  const selectionHandler = (event: React.MouseEvent) => {
    // CMD + Click deselect the item
    if (props.item.isSelected && event.metaKey) {
      props.actionHandler(ItemAction.setSelected, "")
    } else if (!props.item.isSelected) {
      props.actionHandler(ItemAction.setSelected, props.item.key)
    }
  }

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
          contextMenu={contextMenuHandler}
          selectionHandler={selectionHandler}
        />
      </div>
    )
  }

  return (
    <div className="SingleListItem">
      <LeafItem item={props.item} actionHandler={props.actionHandler} contextMenu={contextMenuHandler} selectionHandler={selectionHandler} />
    </div>
  )
}

/// Behaves exactly like HTML <details> tag but it only discloses when tapping on the disclose icon
export const ToggleDisclosureItem = (props: { item: DisclosureItemModel, 
                                              icon: JSX.Element, 
                                              actionHandler: ItemActionHandler, 
                                              contextMenu: (event: React.MouseEvent) => void, 
                                              selectionHandler: (event: React.MouseEvent) => void }) => {
  const visibilityHandler = (event: React.MouseEvent) => {
    props.actionHandler(ItemAction.toggleVisibility, props.item.key)
    event.stopPropagation()
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
    <div className={className} onClick={props.selectionHandler} onContextMenu={props.contextMenu}>
      <button className={buttonClass} style={selectedDisclosureIconColor} onClick={(e) => visibilityHandler(e)} />
      {props.icon}
      {props.item.label}
    </div>
  )
}

/// Represents a list item that has no subitems - like a three leaf.
export const LeafItem = (props: { item: DisclosureItemModel, 
                                  actionHandler: ItemActionHandler, 
                                  contextMenu: (event: React.MouseEvent) => void, 
                                  selectionHandler: (event: React.MouseEvent) => void }) => {
  let className = "LeafSingleListItem"
  if (props.item.isSelected) { className += " SelectedItem" }

  let iconClassName = "Icon"
  if (props.item.isSelected) { iconClassName += " SelectedIcon" }

  return (
    <div className={className} onClick={props.selectionHandler} onContextMenu={props.contextMenu}>
      {props.item.isBlocked ? 
        <BlockedIcon className="Icon Blocked" /> :
        props.item.isLoading ?
        <LoadingIcon className="Icon" /> :
        <FileIcon className={iconClassName} />}
      {props.item.label}
    </div>
  )
}