import React, { useState, useEffect } from 'react';
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

type SetDisclosureListState = React.Dispatch<React.SetStateAction<DisclosureListState>>
type KeyAction = ((itemKey: string) => void)
type KeyboardAction = ((event: Event, item: DisclosureItemModel) => void)

export const DisclosureList = (props: { list: DisclosureListModel }) => {
    const [listState, setListState] = useState(new DisclosureListState())

    const setSelectedItem = (selectedItemKey: string) => {
        props.list.selectedItemKey = selectedFileIcon
        setListState({ ...listState, selectedItemKey })
    }
    const toggleVisibility = (itemKey: string) => {
        const openItems = listState.openItemsKeys
        const openKeyIndex = openItems.indexOf(itemKey)
        if (openKeyIndex !== -1) {
            delete openItems[openKeyIndex]
        } else {
            openItems.push(itemKey)
        }
        setListState({ ...listState, openItemsKeys: openItems })
    }

    const onKeyboardKeyDown = (event: Event, item: DisclosureItemModel) => onKeyboardInput(event, item, setSelectedItem, toggleVisibility, props.list, setListState)

    return (
        <RecursiveDisclosureList items={props.list.items}
                                 selectedItemKey={listState.selectedItemKey}
                                 openItemsKeys={listState.openItemsKeys}
                                 selectionHandler={setSelectedItem}
                                 visibilityHandler={toggleVisibility}
                                 keyboardHandler={onKeyboardKeyDown}/>
    )
}

const RecursiveDisclosureList = (props: { items: DisclosureItemModel[],
                                 selectedItemKey: string,
                                 openItemsKeys: string[],
                                 selectionHandler: KeyAction,
                                 visibilityHandler: KeyAction,
                                 keyboardHandler: KeyboardAction }) => {
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
                                                              selectionHandler={props.selectionHandler}
                                                              visibilityHandler={props.visibilityHandler}
                                                              keyboardHandler={props.keyboardHandler} />)}
        </>
    )
}

const RecursiveDisclosureItem = (props: { item: DisclosureItemModel,
                                          selectedItemKey: string,
                                          openItemsKeys: string[],
                                          selectionHandler: KeyAction,
                                          visibilityHandler: KeyAction,
                                          keyboardHandler: KeyboardAction }) => {
    if (props.item.hasSubItems && props.item.isOpen) {
        return (
            <div className="ListItem">
                <DisclosureItem item={props.item}
                                selectionHandler={props.selectionHandler}
                                visibilityHandler={props.visibilityHandler}
                                keyboardHandler={props.keyboardHandler} />
                <ul>
                    <RecursiveDisclosureList items={props.item.subItems}
                                             selectedItemKey={props.selectedItemKey}
                                             openItemsKeys={props.openItemsKeys}
                                             selectionHandler={props.selectionHandler}
                                             visibilityHandler={props.visibilityHandler}
                                             keyboardHandler={props.keyboardHandler} />
                </ul>
            </div>
        )
    }
    
    return <DisclosureItem item={props.item} 
                           selectionHandler={props.selectionHandler} 
                           visibilityHandler={props.visibilityHandler} 
                           keyboardHandler={props.keyboardHandler} />
}

const DisclosureItem = (props: { item: DisclosureItemModel,
                                 selectionHandler: KeyAction,
                                 visibilityHandler: KeyAction,
                                 keyboardHandler: KeyboardAction }) => {
    let itemImage = ""
    if (props.item.isRoot) { itemImage = props.item.isSelected ? selectedWebsiteIcon : websiteIcon }
    else if (props.item.hasSubItems) { itemImage = props.item.isSelected ? selectedFolderIcon : folderIcon }
    else { itemImage = props.item.isSelected ? selectedFileIcon : fileIcon }

    if (props.item.hasSubItems) {
        return (
            <div className="SingleListItem">
                <ToggleDisclosureItem item={props.item}
                                      image={itemImage}
                                      selectionHandler={props.selectionHandler} 
                                      visibilityHandler={props.visibilityHandler}
                                      keyboardHandler={props.keyboardHandler}
                />
            </div>
        )
    }
    
    const selectedStyle = props.item.isSelected ? { backgroundColor: '#257AFD', color: '#FFF' } : { color: '#B6B6B6' }
    return <div className="LeafSingleListItem" onClick={() => props.selectionHandler(props.item.key)} style={selectedStyle}>
                <img src={itemImage}/>
                {props.item.label}
           </div>
}

/**
 * Behaves exactly like HTML <details> tag but it only discloses when tapping on the disclose icon, and provides a callback
 * for outside touches
 */
const ToggleDisclosureItem = (props: { item: DisclosureItemModel,
                                       image: string,
                                       selectionHandler: KeyAction,
                                       visibilityHandler: KeyAction,
                                       keyboardHandler: KeyboardAction }) => {

    const keyboardEventHandler = (event: KeyboardEvent) => props.keyboardHandler(event, props.item)
    const visibilityHandler = (event: React.MouseEvent) => {
        props.visibilityHandler(props.item.key)
        event.stopPropagation()
    }

    useEffect(() => {
        document.addEventListener("keydown", keyboardEventHandler, false)

        return () => {
            document.removeEventListener('keydown', keyboardEventHandler)
        }
    })
    // Div-style based on selection state
    const selectedStyle = props.item.isSelected ? { backgroundColor: '#257AFD', color: '#FFF' } : { color: '#B6B6B6' }
    const selectedDisclosureIconColor = props.item.isSelected ? props.item.isOpen ? { borderTopColor: '#FFF' } : { borderLeftColor: '#FFF' } : { }
    const buttonClass = props.item.isOpen ? "DiscloseOpenIcon" : "DiscloseClosedIcon"
    return (
        <div className="DiscloseFinalItem" style={selectedStyle} onClick={() => props.selectionHandler(props.item.key)}>
            <button className={buttonClass} style={selectedDisclosureIconColor} onClick={(e) => visibilityHandler(e)}/>
            <img src={props.image}/>
            {props.item.label}
        </div>
    )
}

function onKeyboardInput(event: Event, 
                         item: DisclosureItemModel, 
                         setSelected: KeyAction,
                         toggleVisibility: KeyAction,
                         list: DisclosureListModel, 
                         setListState: SetDisclosureListState) {
    const keyboardEvent = event as KeyboardEvent
    switch (keyboardEvent.key) {
        case "ArrowLeft":
            if (item.isSelected && item.isOpen) { toggleVisibility(item.key) }
            break
        case "ArrowRight":
            if (item.isSelected && item.isOpen) { toggleVisibility(item.key) }
            break
        case "ArrowUp":
            // todo
            break
        case "ArrowDown":
            // todo
            break
        
        default: break
    }
}

