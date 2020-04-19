export class DisclosureItem {
    get hasSubItems(): boolean { return this.subItems.length > 0 }
    
    constructor(public key: string,
                public label: string,
                public isRoot: boolean,
                public subItems: DisclosureItem[],
                public isOpen: boolean = false,
                public isSelected: boolean = false) { }
}