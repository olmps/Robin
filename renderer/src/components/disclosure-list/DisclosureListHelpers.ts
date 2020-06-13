import { DisclosureListModel, DisclosureItemModel } from "./models"
import { ContextMenuItem } from "../context-menu/ContextMenu"

// An action that is executed on a list item
enum ItemAction { setSelected, toggleVisibility, rightClick }

export type ItemActionHandler = (action: ItemAction, content: any) => void

enum ContextAction { focus, intercept }

export interface ContextMenuData {
  item: DisclosureItemModel,
  path: string,
  clientX: number,
  clientY: number
}

export type ContextMenuActionHandler = () => void

/// Setup transient properties on the list items.
function setupTransientProperties(list: DisclosureListModel, selectedItemKey: string, openItemsKeys: string[], focusedPaths: string[]) {
  const flattenList = list.flatten([], true)

  flattenList.forEach(item => {
    item.isSelected = item.key === selectedItemKey
    item.isOpen = openItemsKeys.includes(item.key)
    item.isFocused = focusedPaths.find(path => path.includes(item.path)) !== undefined
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

// Handle keyboard input events
function onKeyboardInput(event: KeyboardEvent,
                        item: DisclosureItemModel,
                        openItemsKeys: string[],
                        itemAction: ItemActionHandler,
                        list: DisclosureListModel) {
  switch (event.key) {
    case "ArrowLeft":
      event.preventDefault()
      if (item.isSelected) {
        if (item.isOpen) {
          itemAction(ItemAction.toggleVisibility, item.key)
        } else if (item.hasSubItems) {
          const previousDisclosureItem = previousItem(item, openItemsKeys, list)
          if (previousDisclosureItem) { itemAction(ItemAction.toggleVisibility, previousDisclosureItem.key) }
        }
      }
      break
    case "ArrowRight":
      event.preventDefault()
      if (item.isSelected && !item.isOpen) { itemAction(ItemAction.toggleVisibility, item.key) }
      break
    case "ArrowUp":
      event.preventDefault()
      const previousDisclosureItem = previousItem(item, openItemsKeys, list)
      if (previousDisclosureItem) { itemAction(ItemAction.setSelected, previousDisclosureItem.key) }
      break
    case "ArrowDown":
      event.preventDefault()
      const nextDisclosureItem = nextItem(item, openItemsKeys, list)
      if (nextDisclosureItem) { itemAction(ItemAction.setSelected, nextDisclosureItem.key) }
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

function contextMenuDataSource(item: DisclosureItemModel, contextHandler: (action: ContextAction) => void): ContextMenuItem[] {
  const focusTitle = item.isFocused ? "Unfocus" : "Focus"
  const focus: ContextMenuItem = { title: focusTitle, action: () => contextHandler(ContextAction.focus) }

  const interceptTitle = item.isIntercepting ? "Disable Intercept" : "Enable Intercept"
  const intercept: ContextMenuItem = { title: interceptTitle, action: () => contextHandler(ContextAction.intercept) }
  
  return [focus, intercept]
}

export { ItemAction, ContextAction }
export { setupTransientProperties, getHighlightedItems, onKeyboardInput, contextMenuDataSource }
