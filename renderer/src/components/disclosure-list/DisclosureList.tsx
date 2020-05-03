import React, { useState, useEffect, useRef } from 'react'

// Actions
import { setupTransientItems, Action, onKeyboardInput, KeyAction } from './DisclosureListActions'

// Models
import { DisclosureListModel, DisclosureItemModel } from './models'

// Images
import websiteIcon from '../../resources/assets/disclosure-list/website_icon.svg'
import selectedWebsiteIcon from '../../resources/assets/disclosure-list/website_icon_selected.svg'
import folderIcon from '../../resources/assets/disclosure-list/folder_icon.svg'
import selectedFolderIcon from '../../resources/assets/disclosure-list/folder_icon_selected.svg'
import fileIcon from '../../resources/assets/disclosure-list/file_icon.svg'
import selectedFileIcon from '../../resources/assets/disclosure-list/file_icon_selected.svg'

// Style
import './DisclosureList.css'

class DisclosureListState {
    constructor(public selectedItemKey: string = "",  public openItemsKeys: string[] = []) { }
}

type SelectCycleHandler = (selectedCycleId: string, associatedRequestsIds: string[]) => void

export const DisclosureList = (props: { list: DisclosureListModel, selectionHandler: SelectCycleHandler }) => {
    const [listState, setListState] = useState(new DisclosureListState())
    
    setupTransientItems(props.list, listState.selectedItemKey, listState.openItemsKeys)

    const itemAction = (action: Action, itemKey: string) => {
        switch (action) {
            case Action.setSelected:
                const selectedItem = props.list.getItem(itemKey)!
                const underneathRequestsKeys = selectedItem.underneathOriginalRequestKeys()
                props.selectionHandler(selectedItem.originalRequestKey, underneathRequestsKeys)
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
            props.selectionHandler("", [])
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
    const selectionHandler = (event: React.MouseEvent) => {
        // CMD + Click deselect the item
        if (props.item.isSelected && event.metaKey) {
            props.actionHandler(Action.setSelected, "")
        } else if (!props.item.isSelected) {
            props.actionHandler(Action.setSelected, props.item.key)
        }
    }
    
    const selectedDisclosureIconColor = props.item.isSelected ? props.item.isOpen ? { borderTopColor: '#FFF' } : { borderLeftColor: '#FFF' } : { }
    const buttonClass = props.item.isOpen ? "DiscloseOpenIcon" : "DiscloseClosedIcon"
    
    const discloseClassName = props.item.isSelected ? "DiscloseFinalItemSelected" : props.item.isHighlighted ? "DiscloseFinalItemHighlighted" : "DiscloseFinalItem"
    return (
        <div className={discloseClassName} onClick={(e) => selectionHandler(e)}>
            <button className={buttonClass} style={selectedDisclosureIconColor} onClick={(e) => visibilityHandler(e)}/>
            <img src={props.image}/>
            {props.item.label}
        </div>
    )
}