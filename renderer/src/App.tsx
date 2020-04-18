import React, { useState, useEffect } from 'react';
import { NetworkRequest, networkRequest } from './models/request';
import DisclosureRequestsList from './components/disclosure-list/DisclosureRequestsList';
const { ipcRenderer } = window.require('electron');

const Home = () => {
  const homeState = useHomeState()
  return (
    <>
      <h1>Requests</h1>
      <DisclosureRequestsList requests={homeState.requests} />
    </>
  )
}

class InitialHomeState {
  requests: NetworkRequest[]

  constructor(requests: NetworkRequest[]) {
    this.requests = requests
  }
}

const useHomeState = () => {
  const [homeState, setHomeState] = useState(new InitialHomeState([]))
  useEffect(() => {
    function proxyRequestHandler(requestPayload: any) {
      setHomeState(state => {
        const newRequest = new NetworkRequest(requestPayload.hostname, requestPayload.url, networkRequest(requestPayload.method))
        const requests = state.requests
        requests.push(newRequest)
        return { ...state, requests }
      })
    }
    
    // Ensure that ipcRenderer is not already registered. It may happening while
    // debugging for example, when React hot reload.
    if (ipcRenderer.rawListeners('proxy-new-request').length === 0) {
      ipcRenderer.on('proxy-new-request', (evt: any, payload: any) => {
        proxyRequestHandler(payload)
      })
      console.log(ipcRenderer.rawListeners('proxy-new-request'))
    }

    return function unsubscribeProxyListener() {
      console.log("UNSUBSCRIBING")
      ipcRenderer.removeListener('proxy-new-request', proxyRequestHandler)
    }
  }, [])

  // useEffect(() => {
  //   setTimeout(() => {
  //       setHomeState(state => ({ ...state, hasLoaded: true }))
  //     }, 2000);
  // }, [])

  return homeState
}

const App = () => <Home/>

export default App
