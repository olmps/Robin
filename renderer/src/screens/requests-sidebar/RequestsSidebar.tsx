import React, { useState } from 'react'
import RequestsList from './RequestsList'

import { RequestCycle } from '../../models'
import { DiscloseAction, DiscloseActionHandler } from '../../components/disclosure-list/models'

import './RequestsSidebar.css';

class SidebarState {
  constructor(public requestsFilter: string | undefined = undefined) { }
}

const RequestsSidebar = (props: { cycles: RequestCycle[], actionHandler: DiscloseActionHandler }) => {
  const [state, setState] = useState(new SidebarState())

  const listActionHandler = (action: DiscloseAction, content: any | undefined) => {
    // Requests are filtered on this component.
    if (action === DiscloseAction.search) {
      setState({ ...state, requestsFilter: content })
      return
    }

    // Other actions are handled by parent components
    props.actionHandler(action, content)
  }

  const filteredRequests = filterRequests(props.cycles, state.requestsFilter)

  return (
    <div className="RequestsSidebar">
      <RequestsList requests={filteredRequests} actionHandler={listActionHandler} />
    </div>
  )
}

function filterRequests(requests: RequestCycle[], filter: string | undefined): RequestCycle[] {
  if (filter === undefined) { return requests }
  return requests.filter(request => request.fullUrl.includes(filter))
}

export default RequestsSidebar
