import React, { useState, useEffect } from 'react';
import { NetworkRequest } from '../../models/request';
import RequestsList from './RequestsList';
import './RequestsSidebar.css';
const { ipcRenderer } = window.require('electron');

class SidebarState {
  constructor(public requests: NetworkRequest[] = [],
              public requestsFilter: string | undefined = undefined) { }
}

const RequestsSidebar = () => {
  const [sidebarState, setSidebarState] = useState(new SidebarState())

  const newRequestHandler = (request: NetworkRequest) => {
    setSidebarState(state => {
        const requests = state.requests
        state.requests.forEach(request => request.isNewRequest = false)
        requests.push(request)
        return { ...state, requests }
    })
  }

  const filterHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSidebarState({ ...sidebarState, requestsFilter: event.target.value })
  }

  RequestsHandler(newRequestHandler)

  const filteredRequests = filterRequests(sidebarState.requests, sidebarState.requestsFilter)

  return (
    <div className="RequestsSidebar">
      <input className="FilterTextField" placeholder="Filter" type="text" onChange={(e) => filterHandler(e)} />
      <RequestsList requests={filteredRequests} />
    </div>
  )
}

const RequestsHandler = (requestHandler: (request: NetworkRequest) => void) => {
  useEffect(() => {
    // Ensure that ipcRenderer is not already registered. It may happening while
    // debugging for example, when React hot reload.
    if (ipcRenderer.rawListeners('proxy-new-request').length === 0) {
      ipcRenderer.on('proxy-new-request', (evt: any, requestPayload: any) => {
        const request = NetworkRequest.fromJson(requestPayload)
        requestHandler(request)
      })
    }

    return function unsubscribeProxyListener() {
      ipcRenderer.removeListener('proxy-new-request', requestHandler)
    }
  }, [])
}

function filterRequests(requests: NetworkRequest[], filter: string | undefined): NetworkRequest[] {
  if (filter === undefined) { return requests }

  return requests.filter(request => request.fullUrl.includes(filter))
}

export default RequestsSidebar
