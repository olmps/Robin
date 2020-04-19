import React, { useState } from 'react';
import { DisclosureItem } from './DisclosureItem'
import { DisclosureList } from './DisclosureList';

// Images
import websiteIcon from '../../resources/assets/website_icon.svg'
import selectedWebsiteIcon from '../../resources/assets/website_icon_selected.svg'
import folderIcon from '../../resources/assets/folder_icon.svg'
import selectedFolderIcon from '../../resources/assets/folder_icon_selected.svg'
import fileIcon from '../../resources/assets/file_icon.svg'
import selectedFileIcon from '../../resources/assets/file_icon_selected.svg'

// Style
import './DisclosureListItem.css'

export const DisclosureListItem = ({ list }: { list: DisclosureList }) => {
    const [listState, setListState] = useState({ selectedItemKey: list.selectedItemKey })

    const toggleSelection = (selectedItemKey: string) => {
        list.selectedItemKey = selectedFileIcon
        setListState({ selectedItemKey })
    }

    return (
        <DisclosureListElement items={list.items} selectedItemKey={listState.selectedItemKey} toggleSelection={toggleSelection} />
    )
}

const DisclosureListElement = ({ items, selectedItemKey, toggleSelection }: { items: DisclosureItem[], selectedItemKey: string, toggleSelection: ((itemKey: string) => void) }) => {
    return (
        <>
            {items.map(item => <ListItem key={item.key} item={item} selectedItemKey={selectedItemKey} toggleSelection={toggleSelection} />)}
        </>
    )
}

const ListItem = ({ item, selectedItemKey, toggleSelection }: { item: DisclosureItem, selectedItemKey: string, toggleSelection: ((itemKey: string) => void) }) => {
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
                <SingleListItem item={item} toggleAction={toggleItem} selectAction={toggleSelection}/>
                <ul>
                    <DisclosureListElement items={item.subItems} selectedItemKey={selectedItemKey} toggleSelection={toggleSelection} />
                </ul>
            </div>
        )
    }
    
    return <SingleListItem item={item} toggleAction={toggleItem} selectAction={toggleSelection}/>
}

const SingleListItem = ({ item, toggleAction, selectAction }: { item: DisclosureItem, toggleAction: ((isOpen: boolean) => void), selectAction: ((selectedItemKey: string) => void) }) => {
    let itemImage = ""
    if (item.isRoot) { itemImage = item.isSelected ? selectedWebsiteIcon : websiteIcon }
    else if (item.hasSubItems) { itemImage = item.isSelected ? selectedFolderIcon : folderIcon }
    else { itemImage = item.isSelected ? selectedFileIcon : fileIcon }

    if (item.hasSubItems) {
        return (
            <div className="SingleListItem">
                <DisclosureFinalItem label={item.label}
                                image={itemImage}
                                isOpen={item.isOpen} 
                                isSelected={item.isSelected} 
                                toggleSelection={() => selectAction(item.key)} 
                                discloseAction={(e) => detailsToggled(e, item, toggleAction)}
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
const DisclosureFinalItem = ({ label, image, isOpen, isSelected, toggleSelection, discloseAction }: 
                    { label: string, image: string, isOpen: boolean, isSelected: boolean, toggleSelection: (() => void), discloseAction: ((event: React.MouseEvent) => void)}) => {
    
    // Div-style based on selection state
    const selectedStyle = isSelected ? { backgroundColor: '#257AFD', color: '#FFF' } : { color: '#B6B6B6' }
    const selectedDisclosureIconColor = isSelected ? isOpen ? { borderTopColor: '#FFF' } : { borderLeftColor: '#FFF' } : { }
    const buttonClass = isOpen ? "DiscloseOpenIcon" : "DiscloseClosedIcon"
    return (
        <div className="DiscloseFinalItem" style={selectedStyle} onClick={() => toggleSelection()}>
            <button className={buttonClass} style={selectedDisclosureIconColor} onClick={(e) => discloseAction(e)}/><img src={image}/>{label}
        </div>
    )
}

function detailsToggled(event: React.MouseEvent, item: DisclosureItem, toggleAction: ((isOpen: boolean) => void)) {
    toggleAction(!item.isOpen)
    event.stopPropagation()
}