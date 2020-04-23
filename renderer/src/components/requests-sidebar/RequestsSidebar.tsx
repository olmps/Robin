import React, { useState, useEffect } from 'react';
import { NetworkRequest } from '../../../../shared/models/request';
import RequestsList from './RequestsList';
import './RequestsSidebar.css';
const { ipcRenderer } = window.require('electron');

const RequestsSidebar = () => {
  const sidebarState = useSidebarState()
  return (
    <div className="RequestsSidebar">
      <RequestsList requests={sidebarState.requests} />
    </div>
  )
}

class SidebarState {
  constructor(public requests: NetworkRequest[]) { }
}

const useSidebarState = () => {
  const [sidebarState, setSidebarState] = useState(new SidebarState([]))
  useEffect(() => {
    function proxyRequestHandler(requestPayload: NetworkRequest) {
      setSidebarState(state => {
        const requests = state.requests
        state.requests.forEach(request => request.isNewRequest = false)
        requests.push(requestPayload)
        return { ...state, requests }
      })
    }
    
    // Ensure that ipcRenderer is not already registered. It may happening while
    // debugging for example, when React hot reload.
    if (ipcRenderer.rawListeners('proxy-new-request').length === 0) {
      ipcRenderer.on('proxy-new-request', (evt: any, request: NetworkRequest) => {
        proxyRequestHandler(request)
      })
    }

    return function unsubscribeProxyListener() {
      ipcRenderer.removeListener('proxy-new-request', proxyRequestHandler)
    }
  }, [])

  // useEffect(() => {
  //   setTimeout(() => {
  //       setHomeState(state => ({ ...state, hasLoaded: true }))
  //     }, 2000);
  // }, [])

  return sidebarState
}

export default RequestsSidebar
