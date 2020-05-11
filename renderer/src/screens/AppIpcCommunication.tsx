import { useEffect } from 'react'

import { SetAppState, AppOptions, AppState } from './App'

import { RequestCycle, Request, Response, GeoLocation } from '../models'
import { UpdatedContent, RequestContent, ResponseContent } from '../shared/modules'

const { ipcRenderer } = window.require('electron')

type CycleUpdateHandler = (payload: any, isInterceptEnabled: boolean) => void

/**
 * Responsible for the communication between the App and Electron module.
 * Setup the listeners and modifies `AppState` based on new/updated requests messages
 */
const SetupIpcCommunication = (setAppState: SetAppState, appOptions: AppOptions) => {
  const [newCycleHandler, updateCycleHandler] = ipcHandlers(setAppState)

  useEffect(() => {
    // Ensure that ipcRenderer is not already registered. It may happening while
    // debugging for example, when React hot reload.
    if (ipcRenderer.rawListeners('proxy-new-request').length === 0) {
      ipcRenderer.on('proxy-new-request', (_: any, payload: any) => newCycleHandler(payload, appOptions.isInterceptEnabled))
    }

    if (ipcRenderer.rawListeners('proxy-new-response').length === 0) {
      ipcRenderer.on('proxy-new-response', (_: any, payload: any) => updateCycleHandler(payload, appOptions.isInterceptEnabled))
    }

    return function unsubscribeProxyListener() {
      ipcRenderer.removeListener('proxy-new-request', newCycleHandler)
      ipcRenderer.removeListener('proxy-new-response', updateCycleHandler)
    }
  }, [])
}

function ipcHandlers(setAppState: SetAppState): [CycleUpdateHandler, CycleUpdateHandler] {
  // Handles a new cycle received from main module
  const newCycleHandler = (payload: any, isInterceptEnabled: boolean) => {
    const request = Request.fromJson(payload.requestPayload)
    const cycleId = payload.id
    const geoLocation = GeoLocation.fromJson(payload.geoLocation)
    const cycle = new RequestCycle(cycleId, request, 0, geoLocation, undefined)

    setAppState(state => {
      const cycles = state.cycles
      state.cycles.forEach(cycle => cycle.request.isNewRequest = false)
      cycles.push(cycle)

      const interceptedRequests = state.interceptedRequests
      if (isInterceptEnabled) {
        const { rawMethod, url, headers, body } = request
        const requestContent = { cycleId, method: rawMethod, path: url, headers, body }
        interceptedRequests.push(requestContent)

        console.log("Stacking " + interceptedRequests.length)
      }

      return { ...state, cycles, interceptedRequests }
    })
  }

  // Handles when a cycle is updated in the main module (when a request response is received is an example)
  const updateCycleHandler = (payload: any, isInterceptEnabled: boolean) => {
    const response = Response.fromJson(payload.responsePayload)

    setAppState(state => {
      const cycles = state.cycles
      state.cycles.forEach(cycle => cycle.request.isNewRequest = false)

      const updatedCycle = cycles.find(cycle => cycle.id === payload.id)
      if (updatedCycle) {
        updatedCycle.response = response
        updatedCycle.duration = payload.duration
      }

      const interceptedRequests = state.interceptedRequests
      if (isInterceptEnabled) {
        const { cycleId, status, statusCode, headers } = response
        const updatedContent = { cycleId, status, statusCode, headers }
        interceptedRequests.push(updatedContent)
        console.log("Stacking " + interceptedRequests.length)
      }

      return { ...state, cycles, interceptedRequests }
    })
  }

  return [newCycleHandler, updateCycleHandler]
}

function sendUpdatedProxyOptions(setAppState: SetAppState, isFingerprintEnabled: boolean, isInterceptEnabled: boolean) {
  releaseInterceptedRequests(setAppState)

  const payload = {
    proxyEnabled: isFingerprintEnabled,
    interceptEnabled: isInterceptEnabled
  }
  ipcRenderer.send('proxy-options-updated', payload)
}

function releaseInterceptedRequests(setAppState: SetAppState) {
  setAppState(state => {
    const interceptedContents = state.interceptedRequests
    interceptedContents.forEach(content => {
      const updatedContent: UpdatedContent = {
        action: 'send',
        contentType: 'method' in content ? 'request' : 'response',
        updatedContent: content
      }

      switch (updatedContent.contentType) {
        case 'request':
          ipcRenderer.send(`updated-request-${updatedContent.updatedContent.cycleId}`, updatedContent)
          break
        case 'response':
          ipcRenderer.send(`updated-response-${updatedContent.updatedContent.cycleId}`, updatedContent)
          break
      }
    })

    return { ...state, interceptedRequests: [] }
  })
}

function sendUpdatedContent(updatedContent: UpdatedContent, setAppState: SetAppState) {
  const contentType = updatedContent.contentType

  setAppState(state => {
    const cycles = state.cycles
    const updatedCycle = cycles.find(cycle => cycle.id === updatedContent.updatedContent.cycleId)
    if (updatedCycle) {
      updateCycle(updatedCycle, updatedContent)
    }

    const interceptedRequests = state.interceptedRequests
    const contentIndex = interceptedRequests.indexOf(updatedContent.updatedContent)
    if (contentIndex !== -1) { delete interceptedRequests[contentIndex] }

    return { ...state, cycles, interceptedRequests }
  })

  switch (contentType) {
    case "request": 
      ipcRenderer.send(`updated-request-${updatedContent.updatedContent.cycleId}`, updatedContent)
      break
    case "response": 
      ipcRenderer.send(`updated-response-${updatedContent.updatedContent.cycleId}`, updatedContent)
      break
  }
}

function updateCycle(cycle: RequestCycle, content: UpdatedContent) {
  switch (content.contentType) {
    case "request":
      const requestContent = content.updatedContent as RequestContent
      
      cycle.request.setRequestMethod(requestContent.method)
      cycle.request.url = requestContent.path
      cycle.request.headers = requestContent.headers
      cycle.request.body = requestContent.body
      break
    case "response":
      const responseContent = content.updatedContent as ResponseContent
      
      cycle.response!.statusCode = responseContent.statusCode
      cycle.response!.headers = responseContent.headers
      cycle.response!.body = responseContent.body!
  }
}

export default SetupIpcCommunication
export { sendUpdatedProxyOptions, sendUpdatedContent }