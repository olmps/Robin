import React, { useState } from 'react'
import RequestsList from './RequestsList'

// Models
import { RequestCycle } from '../../../models/request-cycle'

// Styles
import './RequestsSidebar.css';

class SidebarState {
  constructor(public requestsFilter: string | undefined = undefined) { }
}

const RequestsSidebar = ({ cycles }: { cycles: RequestCycle[] }) => {
  const [sidebarState, setSidebarState] = useState(new SidebarState())

  const filterHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSidebarState({ ...sidebarState, requestsFilter: event.target.value })
  }
  
  const filteredRequests = filterRequests(cycles, sidebarState.requestsFilter)

  return (
    <div className="RequestsSidebar">
      <input className="FilterTextField" placeholder="Filter" type="text" onChange={(e) => filterHandler(e)} />
      <RequestsList requests={filteredRequests} />
    </div>
  )
}

function filterRequests(requests: RequestCycle[], filter: string | undefined): RequestCycle[] {
  if (filter === undefined || filter === "") { return requests }

  return requests.filter(request => request.url.includes(filter))
}

export default RequestsSidebar
