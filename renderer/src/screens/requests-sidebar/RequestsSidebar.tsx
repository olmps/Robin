import React, { useState } from 'react'
import RequestsList from './requests-list/RequestsList'

// Models
import { RequestCycle } from '../../models'

// Style
import './RequestsSidebar.css';

class SidebarState {
  constructor(public requestsFilter: string | undefined = undefined) { }
}

const RequestsSidebar = ({ requests }: { requests: RequestCycle[] }) => {
  const [sidebarState, setSidebarState] = useState(new SidebarState())

  const filterHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSidebarState({ ...sidebarState, requestsFilter: event.target.value })
  }

  const filteredRequests = filterRequests(requests, sidebarState.requestsFilter)

  return (
    <div className="RequestsSidebar">
      <input className="FilterTextField" placeholder="Filter" type="text" onChange={(e) => filterHandler(e)} />
      <RequestsList requests={filteredRequests} />
    </div>
  )
}

function filterRequests(requests: RequestCycle[], filter: string | undefined): RequestCycle[] {
  if (filter === undefined) { return requests }

  return requests.filter(request => request.url.includes(filter))
}

export default RequestsSidebar
