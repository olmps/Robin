import React from 'react'

import { DisclosureList } from '../../components/disclosure-list/DisclosureList'

import { RequestCycle } from '../../models'
import { DisclosureListModel, DisclosureItemModel } from '../../components/disclosure-list/models'

import '../../extensions/array+string'

type SelectCycleHandler = (selectedCycleId: string, associatedRequestsIds: string[]) => void

const RequestsList = ( props: { requests: RequestCycle[], selectionHandler: SelectCycleHandler }) => {
  const listItems = buildDisclosureItems(props.requests)
  const list = new DisclosureListModel(listItems)

  // Remove duplicates from the requests ids list
  const selectionHandler = (selectedCycleId: string, associatedRequestsIds: string[]) => {
    let filteredAssociateIds = associatedRequestsIds.unique()
    filteredAssociateIds = filteredAssociateIds.filter(id => id !== selectedCycleId)
    props.selectionHandler(selectedCycleId, filteredAssociateIds)
  }

  return (
    <>
      <ul style={{ paddingLeft: 0 }}>
        <DisclosureList list={list} selectionHandler={selectionHandler} />
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
    let item = new DisclosureItemModel(currentKey.toString(), cycle.id, cycle.fullHostname, true, cycle.isSecure, [])
    currentKey += 1
    return item
  })

  // For each cycle, use `setup` function to recursively build its subItems
  cycles.forEach(cycle => {
    const relatedItem = baseItems.find(item => item.label === cycle.fullHostname)!
    relatedItem.isNew = cycles.find(cycle => cycle.fullHostname === relatedItem.label && cycle.request.isNewRequest) !== undefined
    setup(cycle.url, relatedItem, relatedItem.key, cycle.id)
  })
  
  return baseItems
}

/**
 * Recursively build DisclosureListItems and its subItems
 * @param urlSegment Segment of URL being built.
 * @param item The item that represents current `urlSegment`
 * @param keyPrefix The prefix to be used before the key identifier
 * @param sourceRequestId The identifier from the original request
 */
function setup(urlSegment: string, item: DisclosureItemModel, keyPrefix: String, sourceRequestId: string) {
  // Special scenario where the first URL segment is just a slash ('/'). This scenario means a
  // request on a URL base, like GET www.google.com. We must handle this as a DisclosureItem.Model
  // Other standalone slashes must be ignored, because the `urlSegment` is something like /path/to/page/,
  // and the /page already represents the final segment
  if (urlSegment === "/") {
      const itemKey = `${keyPrefix}${item.subItems.length}`
      const subItem = new DisclosureItemModel(itemKey, sourceRequestId, urlSegment, false, item.isSecure, [])
      subItem.isNew = item.isNew
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

    if (existingItemIndex !== -1) {
      setup(remainingFragments, item.subItems[existingItemIndex], `${keyPrefix}${existingItemIndex}`, sourceRequestId)
    } else {
      const itemKey = `${keyPrefix}${item.subItems.length}`
      const subItem = new DisclosureItemModel(itemKey, sourceRequestId, firstFragment, false, item.isSecure, [])
      subItem.isNew = item.isNew
      item.subItems.push(subItem)
      setup(remainingFragments, subItem, itemKey, sourceRequestId)
    }
  // It's a single-segment, like /page
  } else {
    formattedUrl = formattedUrl.substring(1)
    if (formattedUrl === "") { return }
    const itemKey = `${keyPrefix}${item.subItems.length}`
    const subItem = new DisclosureItemModel(itemKey, sourceRequestId, formattedUrl, false, item.isSecure, [])
    subItem.isNew = item.isNew
    item.subItems.push(subItem)
  }
}

export default RequestsList