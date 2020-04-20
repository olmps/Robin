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
}