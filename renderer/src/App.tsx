import React, { useState, useEffect } from 'react'
import SplitPane from 'react-split-pane'

// Components 
import RequestsSidebar from './screens/requests-sidebar/RequestsSidebar'
import RequestsDetails from './screens/requests-details/RequestsDetails'
import SingleRequestDetails from './screens/single-request-details/SingleRequestDetails'

// Models
import { RequestCycle, GeoLocation } from './models/request-cycle'
import { Request } from './models/request'
import { Response } from './models/response'

// Style
import './App.css'

const { ipcRenderer } = window.require('electron')

class AppState {
    constructor(
        public cycles: RequestCycle[] = [], 
        public selectedCycle: RequestCycle | undefined = undefined,
        public associatedCycles: RequestCycle[] = []) { }
}

type NewCycleHandler = (cycle: RequestCycle) => void
type UpdateCycleHandler = (cycleId: string, duration: number, response: Response) => void
type SelectCycleHandler = (selectedCycleId: string, associatedRequestsIds: string[]) => void

const App = () => {
    const [appState, setAppState] = useState(new AppState())

    const newCycleHandler = (cycle: RequestCycle) => {
        setAppState(state => {
            const cycles = state.cycles
            state.cycles.forEach(cycle => cycle.request.isNewRequest = false)
            cycles.push(cycle)
            return { ...state, cycles }
        })
    }
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
    const selectedCycleHandler = (selectedCycleId: string, associatedRequestsIds: string[]) => {
        const selectedCycle = appState.cycles.find(cycle => cycle.id === selectedCycleId)
        const associatedCycles = appState.cycles.filter(cycle => associatedRequestsIds.includes(cycle.id))

        setAppState(state => {
            return { ...state, selectedCycle, associatedCycles }
        })
    }
      
    SetupIpcListeners(newCycleHandler, updateCycleHandler)

    const hasSelectedRequest: boolean = appState.selectedCycle !== undefined
    const isSingleRequest: boolean = appState.selectedCycle !== undefined && appState.associatedCycles.length === 0

    return (
        <SplitPane split="vertical" minSize={300} defaultSize={300}>
            <RequestsSidebar cycles={appState.cycles} selectionHandler={selectedCycleHandler} />
            { isSingleRequest ?
                <SingleRequestDetails selectedCycle={appState.selectedCycle!} /> :
                hasSelectedRequest ? 
                    <RequestsDetails cycles={appState.associatedCycles.concat([appState.selectedCycle!])} /> : 
                    <RequestsDetails cycles={appState.cycles} />
            }
        </SplitPane>
    )
}

/**
 * Setup listeners that handle new requests and complete cycles.
 * 
 * @param newCycleHandler A handler that handle new cycles. Happens when a new request is made.
 * @param updateCycleHandler A handles that updates an existing cycle with a received response
 */
const SetupIpcListeners = (newCycleHandler: NewCycleHandler, updateCycleHandler: UpdateCycleHandler) => {
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

export default App