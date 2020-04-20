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
    constructor(public selectedItemKey: string = "", public openItemsKeys: string[] = []) { }
}
enum Action {
    setSelected, toggleVisibility, unhighlight
}
type KeyAction = ((action: Action, itemKey: string) => void)

export const DisclosureList = (props: { list: DisclosureListModel }) => {
    const [listState, setListState] = useState(new DisclosureListState())
    
    const itemAction = (action: Action, itemKey: string) => {
        switch (action) {
            case Action.setSelected:
                console.log("setting selected key " + itemKey)
                setListState({ ...listState, selectedItemKey: itemKey })
                break
            case Action.toggleVisibility:
                const openItems = listState.openItemsKeys
                const openKeyIndex = openItems.indexOf(itemKey)
                if (openKeyIndex !== -1) { delete openItems[openKeyIndex] }
                else { openItems.push(itemKey) }
                setListState({ ...listState, openItemsKeys: openItems })
                break
            case Action.unhighlight:
                const item = props.list.getItem(itemKey)
                if (item) { item.isNew = false }
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
        <div ref={wrapperRef}>
            <RecursiveDisclosureList items={props.list.items}
                                 selectedItemKey={listState.selectedItemKey}
                                 openItemsKeys={listState.openItemsKeys}
                                 actionHandler={itemAction} />
        </div>
    )
}

const RecursiveDisclosureList = (props: { items: DisclosureItemModel[],
                                 selectedItemKey: string,
                                 openItemsKeys: string[],
                                 actionHandler: KeyAction }) => {
    // Setup transient vars
    props.items.forEach(item => {
        item.isSelected = item.key === props.selectedItemKey
        item.isOpen = props.openItemsKeys.indexOf(item.key) !== -1
    })
    return (
        <>
            {props.items.map(item => <RecursiveDisclosureItem key={item.key} 
                                                              item={item}
                                                              selectedItemKey={props.selectedItemKey}
                                                              openItemsKeys={props.openItemsKeys}
                                                              actionHandler={props.actionHandler} />)}
        </>
    )
}

const RecursiveDisclosureItem = (props: { item: DisclosureItemModel,
                                          selectedItemKey: string,
                                          openItemsKeys: string[],
                                          actionHandler: KeyAction }) => {
    if (props.item.hasSubItems && props.item.isOpen) {
        return (
            <div className="ListItem">
                <DisclosureItem item={props.item}
                                actionHandler={props.actionHandler} />
                <ul>
                    <RecursiveDisclosureList items={props.item.subItems}
                                             selectedItemKey={props.selectedItemKey}
                                             openItemsKeys={props.openItemsKeys}
                                             actionHandler={props.actionHandler} />
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
    
    let backgroundColor = props.item.isSelected ? { backgroundColor: '#257AFD' } : { }
    const selectedStyle = props.item.isSelected ? { ...backgroundColor , color: '#FFF' } : { color: '#B6B6B6' }
    return (
        <div className="LeafSingleListItem" onClick={() => props.actionHandler(Action.setSelected, props.item.key)} style={selectedStyle}>
            <img src={itemImage}/>{props.item.label}
        </div>
    )
}

/**
 * Behaves exactly like HTML <details> tag but it only discloses when tapping on the disclose icon, and provides a callback
 * for outside touches
 */
const ToggleDisclosureItem = (props: { item: DisclosureItemModel, image: string, actionHandler: KeyAction }) => {
    if (props.item.isNew) {
        setTimeout(() => {
            props.actionHandler(Action.unhighlight, props.item.key)
        }, 1000)
    }
    
    const visibilityHandler = (event: React.MouseEvent) => {
        props.actionHandler(Action.toggleVisibility, props.item.key)
        event.stopPropagation()
    }
    
    const backgroundColor = props.item.isNew ? { backgroundColor: '#FFF' } : props.item.isSelected ? { backgroundColor: '#257AFD' } : { }
    const selectedStyle = props.item.isSelected ? { ...backgroundColor, color: '#FFF' } : { color: '#B6B6B6', ...backgroundColor }
    const selectedDisclosureIconColor = props.item.isSelected ? props.item.isOpen ? { borderTopColor: '#FFF' } : { borderLeftColor: '#FFF' } : { }
    const buttonClass = props.item.isOpen ? "DiscloseOpenIcon" : "DiscloseClosedIcon"
    
    return (
        <div className="DiscloseFinalItem" style={selectedStyle} onClick={() => props.actionHandler(Action.setSelected, props.item.key)}>
            <button className={buttonClass} style={selectedDisclosureIconColor} onClick={(e) => visibilityHandler(e)}/>
            <img src={props.image}/>
            {props.item.label}
        </div>
    )
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
    const flattenItems = flattenList(list.items, openItemsKeys, [])

    const nextItemIndex = flattenItems.indexOf(item) + 1
    if (nextItemIndex < flattenItems.length) { return flattenItems[nextItemIndex] }
    return null
}

function previousItem(item: DisclosureItemModel, openItemsKeys: string[], list: DisclosureListModel): DisclosureItemModel | null {
    const flattenItems = flattenList(list.items, openItemsKeys, [])

    const previousItemIndex = flattenItems.indexOf(item) - 1
    if (previousItemIndex >= 0) { return flattenItems[previousItemIndex] }
    return null
}

function flattenList(items: DisclosureItemModel[], openItemsKeys: string[], flattenArray: DisclosureItemModel[]): DisclosureItemModel[] {
    const result: DisclosureItemModel[] = flattenArray
    items.forEach(item => {
        result.push(item)
        const isOpen = openItemsKeys.indexOf(item.key) !== -1
        if (isOpen) {
            const recursiveResult = flattenList(item.subItems, openItemsKeys, result)
            result.concat(recursiveResult)
        }
    })

    return result
}