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
import './DisclosureListItem.css'

export const DisclosureList = ({ list }: { list: DisclosureListModel }) => {
    const [listState, setListState] = useState({ selectedItemKey: list.selectedItemKey })

    const toggleSelection = (selectedItemKey: string) => {
        list.selectedItemKey = selectedFileIcon
        setListState({ selectedItemKey })
    }

    return (
        <RecursiveDisclosureList items={list.items} selectedItemKey={listState.selectedItemKey} toggleSelection={toggleSelection} />
    )
}

const RecursiveDisclosureList = ({ items, selectedItemKey, toggleSelection }: { items: DisclosureItemModel[], selectedItemKey: string, toggleSelection: ((itemKey: string) => void) }) => {
    return (
        <>
            {items.map(item => <RecursiveDisclosureItem key={item.key} item={item} selectedItemKey={selectedItemKey} toggleSelection={toggleSelection} />)}
        </>
    )
}

const RecursiveDisclosureItem = ({ item, selectedItemKey, toggleSelection }: { item: DisclosureItemModel, selectedItemKey: string, toggleSelection: ((itemKey: string) => void) }) => {
    const [itemState, setItemState] = useState({ isOpen: item.isOpen, isSelected: item.key === selectedItemKey })
    item.isSelected = selectedItemKey === item.key

    const toggleItem = (isOpen: boolean) => {
        item.isOpen = isOpen
        item.isSelected = selectedItemKey === item.key
        setItemState({ isOpen, isSelected: item.key === selectedItemKey })
    }

    if (item.hasSubItems && itemState.isOpen) {
        return (
            <div className="ListItem">
                <DisclosureItem item={item} toggleAction={toggleItem} selectAction={toggleSelection}/>
                <ul>
                    <RecursiveDisclosureList items={item.subItems} selectedItemKey={selectedItemKey} toggleSelection={toggleSelection} />
                </ul>
            </div>
        )
    }
    
    return <DisclosureItem item={item} toggleAction={toggleItem} selectAction={toggleSelection}/>
}

const DisclosureItem = ({ item, toggleAction, selectAction }: { item: DisclosureItemModel, toggleAction: ((isOpen: boolean) => void), selectAction: ((selectedItemKey: string) => void) }) => {
    let itemImage = ""
    if (item.isRoot) { itemImage = item.isSelected ? selectedWebsiteIcon : websiteIcon }
    else if (item.hasSubItems) { itemImage = item.isSelected ? selectedFolderIcon : folderIcon }
    else { itemImage = item.isSelected ? selectedFileIcon : fileIcon }

    if (item.hasSubItems) {
        return (
            <div className="SingleListItem">
                <ToggleDisclosureItem label={item.label}
                                image={itemImage}
                                isOpen={item.isOpen} 
                                isSelected={item.isSelected} 
                                toggleSelection={() => selectAction(item.key)} 
                                discloseAction={(e) => detailsToggled(e, item, toggleAction)}
                                onKeyboardInput={(e) => onKeyboardInput(e, item, toggleAction)}
                />
            </div>
        )
    }
    
    const selectedStyle = item.isSelected ? { backgroundColor: '#257AFD', color: '#FFF' } : { color: '#B6B6B6' }
    return <div className="LeafSingleListItem" onClick={() => selectAction(item.key)} style={selectedStyle}><img src={itemImage}/>{item.label}</div>
}

/**
 * Behaves exactly like HTML <details> tag but it only discloses when tapping on the disclose icon, and provides a callback
 * for outside touches
 */
const ToggleDisclosureItem = ({ label, image, isOpen, isSelected, toggleSelection, discloseAction, onKeyboardInput }: 
                    { label: string, image: string, isOpen: boolean, isSelected: boolean, toggleSelection: (() => void), discloseAction: ((event: Event) => void), onKeyboardInput: ((event: Event) => void)}) => {
    useEffect(() => {
        document.addEventListener("keydown", onKeyboardInput, false)

        return () => {
            document.removeEventListener('keydown', onKeyboardInput)
        }
    })
    // Div-style based on selection state
    const selectedStyle = isSelected ? { backgroundColor: '#257AFD', color: '#FFF' } : { color: '#B6B6B6' }
    const selectedDisclosureIconColor = isSelected ? isOpen ? { borderTopColor: '#FFF' } : { borderLeftColor: '#FFF' } : { }
    const buttonClass = isOpen ? "DiscloseOpenIcon" : "DiscloseClosedIcon"
    return (
        <div className="DiscloseFinalItem" style={selectedStyle} onClick={() => toggleSelection()}>
            <button className={buttonClass} style={selectedDisclosureIconColor} onClick={(e) => discloseAction(e.nativeEvent)}/><img src={image}/>{label}
        </div>
    )
}

function detailsToggled(event: Event, item: DisclosureItemModel, toggleAction: ((isOpen: boolean) => void)) {
    toggleAction(!item.isOpen)
    event.stopPropagation()
}

function onKeyboardInput(event: Event, item: DisclosureItemModel, toggleAction: ((isOpen: boolean) => void)) {
    const keyboardEvent = event as KeyboardEvent
    if (!item.isSelected) { return }
    if (keyboardEvent.key === "ArrowLeft" && item.isOpen) { toggleAction(false) }
    if (keyboardEvent.key === "ArrowRight" && !item.isOpen) { toggleAction(true) }
}