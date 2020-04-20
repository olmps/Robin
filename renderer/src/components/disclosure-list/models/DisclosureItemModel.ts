export class DisclosureItemModel {
    get hasSubItems(): boolean { return this.subItems.length > 0 }
    
    constructor(public key: string,
                public label: string,
                public isRoot: boolean,
                public subItems: DisclosureItemModel[],
                // Transient vars
                public isNew: boolean,
                public isOpen: boolean = false,
                public isSelected: boolean = false) { }

    getItem(key: string): DisclosureItemModel | null {
        if (this.key === key) { return this }

        let searchedItem: DisclosureItemModel | null = null

        for (const item of this.subItems) {
            searchedItem = item.getItem(key)
            if (searchedItem) { return searchedItem }
        }

        return searchedItem
    }
}