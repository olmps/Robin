import { DisclosureItemModel } from "./DisclosureItemModel"

export class DisclosureListModel {
  constructor(public items: DisclosureItemModel[]) { }

  getItem(key: string): DisclosureItemModel | null {
    let searchedItem: DisclosureItemModel | null = null

    for (const item of this.items) {
      searchedItem = item.getItem(key)
      if (searchedItem) { return searchedItem }
    }

    return searchedItem
  }

  /**
   * Creates a flatten version of the list.
   * 
   * It's useful to visualize the list as an array structure instead a tree vision.
   * If `includeHidden` is false, subitems from items that are not open are not included.
   * 
   * @param openItemsKeys List of open items keys
   * @param includeHidden If true, subitems from items that are not open are not included in the flatten list
   */
  flatten(openItemsKeys: string[], includeHidden: boolean): DisclosureItemModel[] {
    return this.recursiveFlattenList(this.items, openItemsKeys, includeHidden, [])
  }

  private recursiveFlattenList(items: DisclosureItemModel[], openItemsKeys: string[], includeHidden: boolean, flattenArray: DisclosureItemModel[] = []): DisclosureItemModel[] {
    const result: DisclosureItemModel[] = flattenArray
    items.forEach(item => {
      result.push(item)
      const isOpen = openItemsKeys.indexOf(item.key) !== -1 || includeHidden
      if (isOpen) {
        const recursiveResult = this.recursiveFlattenList(item.subItems, openItemsKeys, includeHidden, result)
        result.concat(recursiveResult)
      }
    })

    return result
  }
}