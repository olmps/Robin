import React, { useState } from 'react';
import { DisclosureItem } from './DisclosureItem'

// Images
import websiteIcon from '../../resources/website_icon.svg'
import folderIcon from '../../resources/folder.svg'
import fileIcon from '../../resources/file_icon.svg'

export const DisclosureListItem = ({ items }: { items: DisclosureItem[] }) => {
    return (
        <>
            {items.map(item => <ListItem key={item.key} item={item}/>)}
        </>
    )
}

const ListItem = ({ item }: { item: DisclosureItem }) => {
    const [itemState, setItemState] = useState({ isOpen: item.isOpen })
    
    const toggleItem = (isOpen: boolean) => {
        item.isOpen = isOpen
        setItemState({ isOpen })
    }

    if (item.hasSubItems && itemState.isOpen) {
        return (
            <>
            <SingleListItem item={item} toggleAction={toggleItem}/>
            <ul style={{paddingLeft: 20, listStylePosition: "inside"}}>
                <DisclosureListItem items={item.subItems}/>
            </ul>
            </>
        )
    }
    
    return <SingleListItem item={item} toggleAction={toggleItem}/>
}

const SingleListItem = ({ item, toggleAction }: { item: DisclosureItem, toggleAction: ((isOpen: boolean) => void) }) => {
    let itemImage = ""
    if (item.isRoot) { itemImage = websiteIcon }
    else if (item.hasSubItems) { itemImage = folderIcon }
    else { itemImage = fileIcon }

    if (item.hasSubItems) {
        return (
            <details open={item.isOpen} onClick={(e) => {
                e.preventDefault()
                toggleAction(!item.isOpen)
            }}>
                <summary style={{display: 'inline'}}>
                    <img src={itemImage} width="16" height="16" style={{paddingRight: 10, fill: '#B6B6B6'}}/>{item.label}
                </summary>
            </details>
        )
    }

    return <summary style={{display: 'inline'}}><img src={itemImage} width="16" height="16" style={{paddingRight: 10}}/>{item.label}</summary>
}