import React, { useState } from 'react'
import RequestsList from './RequestsList'

// Models
import { RequestCycle } from '../../models'

// Style
import './RequestsSidebar.css';

class SidebarState {
  constructor(public requestsFilter: string | undefined = undefined) { }
}

type SelectCycleHandler = (selectedCycleId: string, associatedRequestsIds: string[]) => void

const RequestsSidebar = ( props: { cycles: RequestCycle[], selectionHandler: SelectCycleHandler }) => {
  const [sidebarState, setSidebarState] = useState(new SidebarState())

  const filterHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSidebarState({ ...sidebarState, requestsFilter: event.target.value })
  }

  const filteredRequests = filterRequests(props.cycles, sidebarState.requestsFilter)

  return (
    <div className="RequestsSidebar">
      <input className="FilterTextField" placeholder="Filter" type="text" onChange={(e) => filterHandler(e)} />
      <RequestsList requests={filteredRequests} selectionHandler={props.selectionHandler} />
    </div>
  )
}

function filterRequests(requests: RequestCycle[], filter: string | undefined): RequestCycle[] {
  if (filter === undefined) { return requests }

  return requests.filter(request => request.url.includes(filter))
}

export default RequestsSidebar
