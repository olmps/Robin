export class DisclosureItemModel {
  public key: string
  public originalRequestKey: string
  public label: string
  public path: string
  public isRoot: boolean
  public subItems: DisclosureItemModel[]

  // Asset properties
  public isSecure: boolean = false
  public isBlocked: boolean = false
  public isLoading: boolean = false

  // Transient properties
  public isHighlighted: boolean = false
  public isOpen: boolean = false
  public isNew: boolean = false
  public isSelected: boolean = false
  public isFocused: boolean = false
  public isIntercepting: boolean = false

  get hasSubItems(): boolean { return this.subItems.length > 0 }

  constructor(key: string, originalRequestKey: string, path: string, label: string, isRoot: boolean, subItems: DisclosureItemModel[]) {
    this.key = key
    this.originalRequestKey = originalRequestKey
    this.label = label
    this.path = path
    this.isRoot = isRoot
    this.subItems = subItems
  }

  /**
   * Fetch item with `key` on items tree.
   * 
   * Recursively search for a subitem which key matches the received one
   */
  getItem(key: string): DisclosureItemModel | null {
    if (this.key === key) { return this }

    let searchedItem: DisclosureItemModel | null = null

    for (const item of this.subItems) {
      searchedItem = item.getItem(key)
      if (searchedItem) { return searchedItem }
    }

    return searchedItem
  }

  /**
   * Recursively run the items tree and indicates if exists at least
   * one new child that is not visible.
   * A child is not visible if the current item is not open
   * 
   * @param visible Indicates if the current item is open.
   */
  hasNewChildrenNotVisible(visible: boolean): boolean {
    let hasNotVisibleChild: boolean = false

    for (const item of this.subItems) {
      if (!visible && item.isNew) { return true }
      hasNotVisibleChild = item.hasNewChildrenNotVisible(item.isOpen)
      if (hasNotVisibleChild) { return hasNotVisibleChild }
    }

    return hasNotVisibleChild
  }

  /**
   * Recursively collect all `originalRequestKey` from subitems. It indicates
   * all requests ids that are represented by this item and its subitems.
   */
  underneathOriginalRequestKeys(): string[] {
    let requestsKeys = [this.originalRequestKey]

    for (const subItem of this.subItems) {
      const subItemKeys = subItem.underneathOriginalRequestKeys()
      requestsKeys = requestsKeys.concat(subItemKeys)
    }

    return requestsKeys
  }
}