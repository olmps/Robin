import React, { useState } from 'react';
import { DisclosureItem } from './DisclosureItem'

// Images
import websiteIcon from '../../resources/website_icon.svg'
import folderIcon from '../../resources/folder.svg'
import fileIcon from '../../resources/file_icon.svg'

// Style
import './DisclosureListItem.css'

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
            <div className="ListItem">
                <SingleListItem item={item} toggleAction={toggleItem}/>
                <ul>
                    <DisclosureListItem items={item.subItems}/>
                </ul>
            </div>
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
            <div className="SingleListItem">
                <details open={item.isOpen} onClick={(e) => detailsToggled(e, item, toggleAction)}>
                    <summary><img src={itemImage}/>{item.label}</summary>
                </details>
            </div>
        )
    }

    return <div className="SingleListItem"><summary><img src={itemImage}/>{item.label}</summary></div>
}

function detailsToggled(event: React.MouseEvent, item: DisclosureItem, toggleAction: ((isOpen: boolean) => void)) {
    event.preventDefault()
    toggleAction(!item.isOpen)
}