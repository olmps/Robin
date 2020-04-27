import { DisclosureListModel, DisclosureItemModel } from "./models"

enum Action {
    setSelected, toggleVisibility
}

export type KeyAction = ((action: Action, itemKey: string) => void)

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

export { Action, setupTransientItems, getHighlightedItems, onKeyboardInput, nextItem, previousItem }
