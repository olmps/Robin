import React, { useState, useEffect, useRef } from 'react';
import { DisclosureItemModel } from './models/DisclosureItemModel'
import { DisclosureListModel } from './models/DisclosureListModel';

// Images
import websiteIcon from '../../resources/assets/website_icon.svg'
import selectedWebsiteIcon from '../../resources/assets/website_icon_selected.svg'
import folderIcon from '../../resources/assets/folder_icon.svg'
import selectedFolderIcon from '../../resources/assets/folder_icon_selected.svg'
import fileIcon from '../../resources/assets/file_icon.svg'
import selectedFileIcon from '../../resources/assets/file_icon_selected.svg'

// Style
import './DisclosureList.css'

class DisclosureListState {
    constructor(public selectedItemKey: string = "",  public openItemsKeys: string[] = []) { }
}
enum Action {
    setSelected, toggleVisibility
}
type KeyAction = ((action: Action, itemKey: string) => void)

export const DisclosureList = (props: { list: DisclosureListModel }) => {
    const [listState, setListState] = useState(new DisclosureListState())
    
    setupTransientItems(props.list, listState.selectedItemKey, listState.openItemsKeys)

    const itemAction = (action: Action, itemKey: string) => {
        switch (action) {
            case Action.setSelected:
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

    const onTapOutside = (event: Event) => {
        if (!wrapperRef.current) { return }
        const targetNode = event.target as Node
        
        // TODO: IMPROVE THIS. IT'S CANCELING TAPS ON OTHER PANES
        if (wrapperRef.current && !wrapperRef.current!.contains(targetNode)) {
            setListState({ ...listState, selectedItemKey: "" })
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
    let itemImage = ""
    if (props.item.isRoot) { itemImage = props.item.isSelected ? selectedWebsiteIcon : websiteIcon }
    else if (props.item.hasSubItems) { itemImage = props.item.isSelected ? selectedFolderIcon : folderIcon }
    else { itemImage = props.item.isSelected ? selectedFileIcon : fileIcon }

    if (props.item.hasSubItems) {
        return (
            <div className="SingleListItem">
                <ToggleDisclosureItem item={props.item}
                                      image={itemImage}
                                      actionHandler={props.actionHandler}
                />
            </div>
        )
    }
    
    const className = props.item.isSelected ? "SelectedLeafSingleListItem" : "LeafSingleListItem"
    return (
        <div className={className} onClick={() => props.actionHandler(Action.setSelected, props.item.key)}>
            <img src={itemImage}/>{props.item.label}
        </div>
    )
}

/**
 * Behaves exactly like HTML <details> tag but it only discloses when tapping on the disclose icon, and provides a callback
 * for outside touches
 */
const ToggleDisclosureItem = (props: { item: DisclosureItemModel, image: string, actionHandler: KeyAction }) => {
    const visibilityHandler = (event: React.MouseEvent) => {
        props.actionHandler(Action.toggleVisibility, props.item.key)
        event.stopPropagation()
    }
    
    const selectedDisclosureIconColor = props.item.isSelected ? props.item.isOpen ? { borderTopColor: '#FFF' } : { borderLeftColor: '#FFF' } : { }
    const buttonClass = props.item.isOpen ? "DiscloseOpenIcon" : "DiscloseClosedIcon"
    
    const discloseClassName = props.item.isSelected ? "DiscloseFinalItemSelected" : props.item.isHighlighted ? "DiscloseFinalItemHighlighted" : "DiscloseFinalItem"
    return (
        <div className={discloseClassName} onClick={() => props.actionHandler(Action.setSelected, props.item.key)}>
            <button className={buttonClass} style={selectedDisclosureIconColor} onClick={(e) => visibilityHandler(e)}/>
            <img src={props.image}/>
            {props.item.label}
        </div>
    )
}

function setupTransientItems(list: DisclosureListModel, selectedItemKey: string, openItemsKeys: string[]) {
    const flattenList = list.flatten([], true)
    // TODO: Explain why is it separate (the second loop depends on this one)
    flattenList.forEach(item => {
        item.isOpen = openItemsKeys.includes(item.key)
    })

    const newHighlightedItems = getHighlightedItems(list.items)

    flattenList.forEach(item => {
        item.isSelected = item.key === selectedItemKey
        item.isHighlighted = newHighlightedItems.includes(item.key)
    })
}

function getHighlightedItems(items: DisclosureItemModel[]): string[] {
    var highlightedItemsKeys: string[] = []
    items.forEach(item => {
        if (!item.isOpen && item.hasNotVisibleChild(item.isOpen)) {
            highlightedItemsKeys.push(item.key)
        } else if (item.subItems.length === 0 && item.isNew) {
            highlightedItemsKeys.push(item.key)
        } else {
            const newItems = getHighlightedItems(item.subItems)
            highlightedItemsKeys = highlightedItemsKeys.concat(newItems)
        }
    })

    return highlightedItemsKeys
}

function onKeyboardInput(event: KeyboardEvent, 
                         item: DisclosureItemModel,
                         openItemsKeys: string[],
                         itemAction: KeyAction,
                         list: DisclosureListModel) {
    switch (event.key) {
        case "ArrowLeft":
            if (item.isSelected) {
                if (item.isOpen) {
                    itemAction(Action.toggleVisibility, item.key)
                } else if (item.hasSubItems) {
                    const previousDisclosureItem = previousItem(item, openItemsKeys, list)
                    if (previousDisclosureItem) { itemAction(Action.toggleVisibility, previousDisclosureItem.key) }
                }
            }
            break
        case "ArrowRight":
            if (item.isSelected && !item.isOpen) { itemAction(Action.toggleVisibility, item.key) }
            break
        case "ArrowUp":
            const previousDisclosureItem = previousItem(item, openItemsKeys, list)
            if (previousDisclosureItem) { itemAction(Action.setSelected, previousDisclosureItem.key) }
            break
        case "ArrowDown":
            const nextDisclosureItem = nextItem(item, openItemsKeys, list)
            if (nextDisclosureItem) { itemAction(Action.setSelected, nextDisclosureItem.key) }
            break
        
        default: break
    }
}

function nextItem(item: DisclosureItemModel, openItemsKeys: string[], list: DisclosureListModel): DisclosureItemModel | null {
    const flattenItems = list.flatten(openItemsKeys, false)

    const nextItemIndex = flattenItems.indexOf(item) + 1
    if (nextItemIndex < flattenItems.length) { return flattenItems[nextItemIndex] }
    return null
}

function previousItem(item: DisclosureItemModel, openItemsKeys: string[], list: DisclosureListModel): DisclosureItemModel | null {
    const flattenItems = list.flatten(openItemsKeys, false)

    const previousItemIndex = flattenItems.indexOf(item) - 1
    if (previousItemIndex >= 0) { return flattenItems[previousItemIndex] }
    return null
}