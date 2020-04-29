import { DisclosureListModel, DisclosureItemModel } from "./models"

enum Action {
    setSelected, toggleVisibility
}

export type KeyAction = ((action: Action, itemKey: string) => void)

function setupTransientProperties(list: DisclosureListModel, selectedItemKey: string, openItemsKeys: string[]) {
    const flattenList = list.flatten([], true)
    
    flattenList.forEach(item => {
        item.isSelected = item.key === selectedItemKey
        item.isOpen = openItemsKeys.includes(item.key)
    })

    const newHighlightedItems = getHighlightedItems(list.items)

    // `isHighlighted` property mut be set before `isOpen` because it needs to know if
    // the item is open to determine if it's highlighted or not.
    flattenList.forEach(item => {
        item.isHighlighted = newHighlightedItems.includes(item.key)
    })
}

/**
 * Recursively iterates through the items and returns those that are highlighted.
 * An item is highlighted if itself is a new item or if it has a child that is
 * a new item but it's not visible.
 */
function getHighlightedItems(items: DisclosureItemModel[]): string[] {
    var highlightedItemsKeys: string[] = []
    items.forEach(item => {
        if (!item.isOpen && item.hasNewChildrenNotVisible(item.isOpen)) {
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

/**
 * Handles keyboard input events
 */
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

/**
 * Finds the next item on the DisclosureList.
 * 
 * This function considers a flatten version of the list, and it's used to navigate through the list using
 * the Arrow keys from the keyboard
 */
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

export { Action, setupTransientProperties as setupTransientItems, getHighlightedItems, onKeyboardInput, nextItem, previousItem }
