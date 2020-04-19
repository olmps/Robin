import React from 'react';
import { NetworkRequest } from '../../../../shared/models/request';
import { DisclosureItem } from './DisclosureItem';
import { DisclosureListItem } from './DisclosureListItem';

const DisclosureRequestsList = ({ requests }: { requests: NetworkRequest[] }) => {
  const listItems = buildDisclosureItems(requests)
  return (
    <>
      <ul style={{paddingLeft: 10}}>
        <DisclosureListItem items={listItems}/>
      </ul>
    </>
  )
}

/**
 * Build a tree of DisclosureItems that will be used later to build the `DisclosureRequestsList`.
 * Each `DisclosureItem` represents a segment of the url.
 * Example: www.google.com/path/to/page AND www.google/path/to/another/page builds:
 * 
 *    - DisclosureItem { label: "www.google.com", isRoot: true, subItems: <BELOW> }
 *      - DisclosureItem { label: "/path", isRoot: false, subItems: <BELOW> }
 *        - DisclosureItem { label: "/to", isRoot: false, subItems: <BELOW> }
 *          - DisclosureItem { label: "/page", isRoot: false, subItems: [] }
 *          - DisclosureItem { label: "/another", isRoot: false, subItems: <BELOW> }
 *            - DisclosureItem { label: "/page", isRoot: false, subItems: [] }
 * 
 * @param requests List of intercepted requests
 */
function buildDisclosureItems(requests: NetworkRequest[]): DisclosureItem[] {
  // Builds the root lever, i.e, the items representing the domains urls (like www.google.com, www.apple.com, etc)
  const baseUrls = requests.map(request => request.domain)
  const filteredBaseUrls = baseUrls.filter((item, index) => baseUrls.indexOf(item) === index) // Remove duplicates

  // We assign an incremental key for each DisclosureItem
  let currentKey = 0
  const baseItems = filteredBaseUrls.map(baseUrl => {
    let item = new DisclosureItem(currentKey.toString(), baseUrl, baseUrl, true, [])
    currentKey += 1
    return item
  })
  
  // To make a cleaner code, encapsulate the key into an object to send as reference
  // to setup function - since it is recursive. It will avoids a bunch o key returns
  let key: { value: number } = { value: currentKey + 1 }

  // For each baseUrl, use `setup` function to recursively build its subItems
  requests.forEach(request => {
    const relatedItem = baseItems.find(item => item.label === request.domain)
    setup(request.url, relatedItem!, key)
  })
  
  return baseItems
}

/**
 * Recursively build DisclosureListItems and its subItems
 * @param urlSegment Segment of URL being built.
 * @param item The item that represents current `urlSegment`
 * @param key Key object
 */
function setup(urlSegment: string, item: DisclosureItem, key: { value: number }) {
  // Special scenario where the first URL segment is just a slash ('/'). This scenario means a
  // request on a URL base, like GET www.google.com. We must handle this as a DisclosureItem.
  // Other standalone slashes must be ignored, because the `urlSegment` is something like /path/to/page/,
  // and the /page already represents the final segment
  if (urlSegment === "/") {
      key.value++
      const subItem = new DisclosureItem(key.value.toString(), urlSegment, urlSegment, false, [])
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
    const existingItem = item.subItems.find(item => item.label === firstFragment)

    if (existingItem) {
      setup(remainingFragments, existingItem, key)
    } else {
      key.value++
      const subItem = new DisclosureItem(key.value.toString(), firstFragment, firstFragment, false, [])
      item.subItems.push(subItem)
      setup(remainingFragments, subItem, key)
    }
  // It's a single-segment, like /page
  } else {
    formattedUrl = formattedUrl.substring(1)
    if (formattedUrl === "") { return }
    key.value++
    const subItem = new DisclosureItem(key.value.toString(), formattedUrl, formattedUrl, false, [])
    item.subItems.push(subItem)
  }
}

export default DisclosureRequestsList