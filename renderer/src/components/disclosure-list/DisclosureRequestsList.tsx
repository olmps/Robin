import React from 'react';
import { NetworkRequest } from '../../../../shared/models/request';
import { DisclosureItem } from './DisclosureItem';
import { DisclosureListItem } from './DisclosureListItem';

const DisclosureRequestsList = ({ requests }: { requests: NetworkRequest[] }) => {
  const listItems = buildDisclosureItems(requests)
  return (
    <>
      <ul>
        <DisclosureListItem items={listItems}/>
      </ul>
    </>
  )
}

/**
 * Build a list of DisclosureItem that will be used later to build the `DisclosureRequestsList`.
 * Each `DisclosureItem` represents a "part" of the url.
 * Example: www.google.com/path/to/page
 *    - DisclosureItem #1: { label: "www.google.com", isRoot: true, subItems: <BELOW> }
 *    - DisclosureItem #2: { label: "/path", isRoot: false, subItems: <BELOW> }
 *    - DisclosureItem #3: { label: "/to", isRoot: false, subItems: <BELOW> }
 *    - DisclosureItem #4: { label: "/page", isRoot: false, subItems: <BELOW> }
 * 
 * @param requests List of intercepted requests
 */
function buildDisclosureItems(requests: NetworkRequest[]): DisclosureItem[] {
  const baseUrls = requests.map(request => request.domain)
  const filteredBaseUrls = baseUrls.filter((item, index) => baseUrls.indexOf(item) === index) // Remove duplicates

  let currentKey = 0
  const baseItems = filteredBaseUrls.map(baseUrl => {
    let item = new DisclosureItem(currentKey.toString(), baseUrl, baseUrl, true, [])
    currentKey += 1
    return item
  })
  
  requests.forEach(request => {
    const relatedItem = baseItems.find(item => item.label === request.domain)
    currentKey = setup(request.url, relatedItem!, currentKey)
  })
  
  return baseItems
}

function setup(url: string, item: DisclosureItem, key: number): number {
  let lastUsedKey = key + 1
  let formattedUrl = url
  const lastElement = url.slice(-1)
  if (lastElement === '/') { formattedUrl = formattedUrl.slice(0, -1) }

  const splitUrl = formattedUrl.split('/')
  splitUrl.shift() // First element is always a standalone `""`
  
  if (splitUrl.length > 1) {
    const firstFragment = splitUrl[0]
    const remainingFragments = formattedUrl.substring(1).replace(firstFragment, "")
    const existingItem = item.subItems.find(item => item.label === firstFragment)

    if (existingItem) {
      return setup(remainingFragments, existingItem, key)
    } else {
      const subItem = new DisclosureItem(lastUsedKey.toString(), firstFragment, firstFragment, false, [])
      item.subItems.push(subItem)
      return setup(remainingFragments, subItem, lastUsedKey)
    }
  } else {
    formattedUrl = formattedUrl.substring(1)
    if (formattedUrl === "") { return key }
    const subItem = new DisclosureItem(lastUsedKey.toString(), formattedUrl, formattedUrl, false, [])
    item.subItems.push(subItem)
    return lastUsedKey
  }
}

export default DisclosureRequestsList