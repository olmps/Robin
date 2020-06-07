import React from 'react'

import { DisclosureList } from '../../components/disclosure-list/DisclosureList'

import { RequestCycle } from '../../models'
import { DisclosureListModel, DisclosureItemModel, DiscloseAction, DiscloseActionHandler } from '../../components/disclosure-list/models'

import '../../extensions/array+string'

const RequestsList = ( props: { requests: RequestCycle[], actionHandler: DiscloseActionHandler }) => {
  const listItems = buildDisclosureItems(props.requests)
  const list = new DisclosureListModel(listItems)

  const listActionHandler = (action: DiscloseAction, content: any | undefined) => {
    switch (action) {
      // Remove duplicates from the underneath id's before moving on
      case DiscloseAction.select:
        const selectedCycleId: string = content[0]
        const associatedRequestsIds: string[] = content[1]
        let filteredAssociateIds = associatedRequestsIds.unique()
        filteredAssociateIds = filteredAssociateIds.filter(id => id !== selectedCycleId)
        props.actionHandler(DiscloseAction.select, [selectedCycleId, filteredAssociateIds])
        break
      default:
        props.actionHandler(action, content)
    }
  }

  return (
    <>
      <ul style={{ paddingLeft: 0, margin: 0 }}>
        <DisclosureList list={list} actionHandler={listActionHandler} />
      </ul>
    </>
  )
}

/**
 * Build a tree of DisclosureItems that will be used later to build the `DisclosureRequestsList`.
 * Each `DisclosureItem` represents a segment of the url.
 * Example: www.google.com/path/to/page AND www.google/path/to/another/page builds:
 * 
 *    - DisclosureItem { key: 1, label: "www.google.com", isRoot: true, subItems: <BELOW> }
 *      - DisclosureItem { key: 11, label: "/path", isRoot: false, subItems: <BELOW> }
 *        - DisclosureItem { key: 111, label: "/to", isRoot: false, subItems: <BELOW> }
 *          - DisclosureItem { key: 1111, label: "/page", isRoot: false, subItems: [] }
 *          - DisclosureItem { key: 1112, label: "/another", isRoot: false, subItems: <BELOW> }
 *            - DisclosureItem { key: 11121, label: "/page", isRoot: false, subItems: [] }
 * 
 * @param cycles List of completed cycles
 */
function buildDisclosureItems(cycles: RequestCycle[]): DisclosureItemModel[] {
  // Builds the root lever, i.e, the items representing the domains urls (like www.google.com, www.apple.com, etc)
  let filteredCycles: RequestCycle[] = []
  cycles.forEach(cycle => {
    if (!filteredCycles.find(target => target.fullHostname === cycle.fullHostname)) { 
      filteredCycles.push(cycle)
    } 
  })

  // All items keys represent the item levels path. See the function description keys for a clear illustration
  // about how the keys represent the items.
  // We start from a great number to avoid duplications, since starting from 1 for example, we couldn't differ if "11"
  // is first subitem from first item or if it's the 11th item.
  let currentKey = 1000000

  const baseItems = filteredCycles.map(cycle => {
    let item = new DisclosureItemModel(currentKey.toString(), cycle.id, cycle.fullHostname, cycle.fullHostname, true, [])
    currentKey += 1
    return item
  })

  // For each cycle, use `setup` function to recursively build its subItems
  cycles.forEach(cycle => {
    const relatedItem = baseItems.find(item => item.label === cycle.fullHostname)!
    relatedItem.isNew = cycles.find(cycle => cycle.fullHostname === relatedItem.label && cycle.request.isNewRequest) !== undefined
    const staticValues = {
      sourceRequestId: cycle.id, 
      isBlocked: cycle.request.dropped, 
      isLoading: cycle.response === undefined
    }
    setup(cycle.url, cycle.fullHostname, relatedItem, relatedItem.key, staticValues)
  })
  
  return baseItems
}

/**
 * Recursively build DisclosureListItems and its subItems
 * @param urlSegment Segment of URL being built.
 * @param item The item that represents current `urlSegment`
 * @param keyPrefix The prefix to be used before the key identifier
 * @param sourceRequestId The identifier from the original request
 * @param staticValues Static values that must be propagated to child items
 */
function setup(urlSegment: string, fullPath: string, item: DisclosureItemModel, keyPrefix: String, staticValues: any) {
  // Special scenario where the first URL segment is just a slash ('/'). This scenario means a
  // request on a URL base, like GET www.google.com. We must handle this as a DisclosureItem.Model
  // Other standalone slashes must be ignored, because the `urlSegment` is something like /path/to/page/,
  // and the /page already represents the final segment
  if (urlSegment === "/") {
      fullPath += "/"
      const itemKey = `${keyPrefix}${item.subItems.length}`
      const subItem = new DisclosureItemModel(itemKey, staticValues.sourceRequestId, urlSegment, fullPath, false, [])
      subItem.isNew = item.isNew
      subItem.isBlocked = staticValues.isBlocked
      subItem.isLoading = staticValues.isLoading
      item.subItems.push(subItem)
      return
  }

  let formattedUrl = urlSegment
  const lastElement = urlSegment.slice(-1)
  // Removes the last URL slash to avoid scenarios like the described above: /path/to/
  if (lastElement === '/') { formattedUrl = formattedUrl.slice(0, -1) }
  
  const splitUrl = formattedUrl.split('/')
  splitUrl.shift() // First element is always a standalone `""`, so we must ignore it
  
  // It's a multi-segment url, like /path/to/page
  if (splitUrl.length > 1) {
    const firstFragment = splitUrl[0]
    const remainingFragments = formattedUrl.substring(1).replace(firstFragment, "")
    const existingItemIndex = item.subItems.findIndex(item => item.label === firstFragment)
    fullPath += `/${firstFragment}`

    if (existingItemIndex !== -1) {
      setup(remainingFragments, fullPath, item.subItems[existingItemIndex], `${keyPrefix}${existingItemIndex}`, staticValues)
    } else {
      const itemKey = `${keyPrefix}${item.subItems.length}`
      const subItem = new DisclosureItemModel(itemKey, staticValues.sourceRequestId, firstFragment, fullPath, false, [])
      subItem.isNew = item.isNew
      subItem.isBlocked = staticValues.isBlocked
      subItem.isLoading = staticValues.isLoading
      item.subItems.push(subItem)
      setup(remainingFragments, fullPath, subItem, itemKey, staticValues)
    }
  // It's a single-segment, like /page
  } else {
    formattedUrl = formattedUrl.substring(1)
    fullPath += `/${formattedUrl}`
    if (formattedUrl === "") { return }
    const itemKey = `${keyPrefix}${item.subItems.length}`
    const subItem = new DisclosureItemModel(itemKey, staticValues.sourceRequestId, formattedUrl, fullPath, false, [])
    subItem.isNew = item.isNew
    subItem.isBlocked = staticValues.isBlocked
    subItem.isLoading = staticValues.isLoading
    item.subItems.push(subItem)
  }
}

export default RequestsList