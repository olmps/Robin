import { DisclosureItemModel } from "./DisclosureItemModel"

export class DisclosureListModel {
    constructor(public selectedItemKey: string, public items: DisclosureItemModel[]) { }
}