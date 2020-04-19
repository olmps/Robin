import { DisclosureItem } from "./DisclosureItem"

export class DisclosureList {
    constructor(public selectedItemKey: string, public items: DisclosureItem[]) { }
}