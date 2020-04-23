import { DisclosureItemModel } from "./DisclosureItemModel"

export class DisclosureListModel {
    constructor(public selectedItemKey: string, public items: DisclosureItemModel[]) { }

    getItem(key: string): DisclosureItemModel | null {
        let searchedItem: DisclosureItemModel | null = null

        for (const item of this.items) {
            searchedItem = item.getItem(key)
            if (searchedItem) { return searchedItem }
        }
        
        return searchedItem
    }

    // TODO: DESCRIBE
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