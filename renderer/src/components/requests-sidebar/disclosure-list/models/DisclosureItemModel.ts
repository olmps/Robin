export class DisclosureItemModel {

    // Transient vars
    public isHighlighted: boolean = false
    public isOpen: boolean = false
    public isNew: boolean = false
    public isSelected: boolean = false

    get hasSubItems(): boolean { return this.subItems.length > 0 }
    
    constructor(public key: string,
                public label: string,
                public isRoot: boolean,
                public subItems: DisclosureItemModel[]) { }

    getItem(key: string): DisclosureItemModel | null {
        if (this.key === key) { return this }

        let searchedItem: DisclosureItemModel | null = null

        for (const item of this.subItems) {
            searchedItem = item.getItem(key)
            if (searchedItem) { return searchedItem }
        }

        return searchedItem
    }

    hasNotVisibleChild(visible: boolean): boolean {
        let hasNotVisibleChild: boolean = false

        for (const item of this.subItems) {
            if (!visible && item.isNew) { return true }
            hasNotVisibleChild = item.hasNotVisibleChild(item.isOpen)
            if (hasNotVisibleChild) { return hasNotVisibleChild }
        }

        return hasNotVisibleChild
    }

    removeNewChilds() {
        for (const item of this.subItems) {
            item.isNew = false
            item.removeNewChilds()
        }
    }
}