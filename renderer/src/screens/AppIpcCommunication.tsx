import { useEffect } from 'react'

import { SetAppState } from './App'

import { Request, RequestCycle, GeoLocation, Response } from '../models'

const { ipcRenderer } = window.require('electron')

type NewCycleHandler = (cycle: RequestCycle) => void
type UpdateCycleHandler = (cycleId: string, duration: number, response: Response) => void

/**
 * Responsible for the communication between the App and Electron module.
 * Setup the listeners and modifies `AppState` based on new/updated requests messages
 */
const SetupIpcCommunication = (setAppState: SetAppState) => {
  const [newCycleHandler, updateCycleHandler] = ipcHandlers(setAppState)

  useEffect(() => {
    // Ensure that ipcRenderer is not already registered. It may happening while
    // debugging for example, when React hot reload.
    if (ipcRenderer.rawListeners('proxy-new-request').length === 0) {
      ipcRenderer.on('proxy-new-request', (_: any, payload: any) => {
        const request = Request.fromJson(payload.requestPayload)
        const cycleId = payload.id
        const geoLocation = GeoLocation.fromJson(payload.geoLocation)
        const newCycle = new RequestCycle(cycleId, request, 0, geoLocation, undefined)
        newCycleHandler(newCycle)
      })
    }

    if (ipcRenderer.rawListeners('proxy-new-response').length === 0) {
      ipcRenderer.on('proxy-new-response', (_: any, responsePayload: any) => {
        const response = Response.fromJson(responsePayload)
        updateCycleHandler(responsePayload.id, responsePayload.duration, response)
      })
    }

    return function unsubscribeProxyListener() {
      ipcRenderer.removeListener('proxy-new-request', newCycleHandler)
      ipcRenderer.removeListener('proxy-new-response', updateCycleHandler)
    }
  }, [])
}

function ipcHandlers(setAppState: SetAppState): [NewCycleHandler, UpdateCycleHandler] {
  // Handles a new cycle received from main module
  const newCycleHandler = (cycle: RequestCycle) => {
    setAppState(state => {
      const cycles = state.cycles
      state.cycles.forEach(cycle => cycle.request.isNewRequest = false)
      cycles.push(cycle)
      return { ...state, cycles }
    })
  }

  // Handles when a cycle is updated in the main module (when a request response is received is an example)
  const updateCycleHandler = (cycleId: string, duration: number, response: Response) => {
    setAppState(state => {
      const cycles = state.cycles
      state.cycles.forEach(cycle => cycle.request.isNewRequest = false)

      const updatedCycle = cycles.find(cycle => cycle.id === cycleId)
      if (updatedCycle) {
        updatedCycle.response = response
        updatedCycle.duration = duration
      }
      return { ...state, cycles }
    })
  }

  return [newCycleHandler, updateCycleHandler]
}

export default SetupIpcCommunication