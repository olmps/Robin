import React, { useState } from 'react'
import SplitPane from 'react-split-pane'

import Toolbar, { ToolbarAction } from './toolbar/Toolbar'
import RequestsSidebar from './requests-sidebar/RequestsSidebar'
import RequestsDetails from './requests-details/RequestsDetails'
import SingleRequestDetails from './single-request-details/SingleRequestDetails'

import SetupIpcCommunication from './AppIpcCommunication'

import { RequestCycle } from '../models'

import './App.css'

class AppOptions {
  constructor(
    public isFingerprintEnabled: boolean = true) { }
}

class AppState {
  constructor(
    public cycles: RequestCycle[] = [],
    public selectedCycle: RequestCycle | undefined = undefined,
    // Associated cycles contains all requests under `selectedCycle` path
    public associatedCycles: RequestCycle[] = [],
    public options: AppOptions = new AppOptions()) { }
}

type SelectCycleHandler = (selectedCycleId: string, associatedRequestsIds: string[]) => void
type ToolbarActionHandler = (action: ToolbarAction) => void

const App = () => {
  const [appState, setAppState] = useState(new AppState())
  const [selectedCycleHandler, toolbarActionHandler] = setupAppHandlers(appState, setAppState)

  SetupIpcCommunication(setAppState)

  const hasSelectedRequest: boolean = appState.selectedCycle !== undefined
  const isSingleRequest: boolean = appState.selectedCycle !== undefined && appState.associatedCycles.length === 0

  return (
    <>
      <Toolbar isFingerprintEnabled={appState.options.isFingerprintEnabled} handler={toolbarActionHandler} />
      <SplitPane split="vertical" minSize={300} defaultSize={300}>
        <RequestsSidebar cycles={appState.cycles} selectionHandler={selectedCycleHandler} />
        {isSingleRequest ?
          <SingleRequestDetails selectedCycle={appState.selectedCycle!} /> :
          hasSelectedRequest ?
            <RequestsDetails cycles={appState.associatedCycles.concat([appState.selectedCycle!])} /> :
            <RequestsDetails cycles={appState.cycles} />
        }
      </SplitPane>
    </>
  )
}

function setupAppHandlers(appState: AppState, setAppState: SetAppState): [SelectCycleHandler, ToolbarActionHandler] {
  // Handles when a cycle is selected on requests list sidebar
  const selectedCycleHandler = (selectedCycleId: string, associatedRequestsIds: string[]) => {
    const selectedCycle = appState.cycles.find(cycle => cycle.id === selectedCycleId)
    const associatedCycles = appState.cycles.filter(cycle => associatedRequestsIds.includes(cycle.id))

    setAppState(state => {
      return { ...state, selectedCycle, associatedCycles }
    })
  }

  // Handles when a toolbar action is triggered
  const toolbarActionHandler = (action: ToolbarAction) => {
    switch (action) {
      case ToolbarAction.clear:
        setAppState(state => {
          return { ...state, cycles: [], selectedCycle: undefined, associatedCycles: [] }
        })
      case ToolbarAction.fingerprintToggled:
        // TODO: WARN ELECTRON THAT FINGERPRINT HAS STOPPED
        const options = appState.options
        options.isFingerprintEnabled = !options.isFingerprintEnabled
        setAppState(state => {
          return { ...state, options }
        })
    }
  }

  return [selectedCycleHandler, toolbarActionHandler]
}

export default App
export { AppState }
export type SetAppState = React.Dispatch<React.SetStateAction<AppState>>