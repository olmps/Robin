import React, { useState } from 'react'

import Toolbar, { ToolbarAction } from './toolbar/Toolbar'
import RequestsSidebar from './requests-sidebar/RequestsSidebar'
import RequestsDetails from './requests-details/RequestsDetails'
import SingleRequestDetails from './single-request-details/SingleRequestDetails'
import SplitPane from '../components/split-pane/SplitPane'
import InterceptedRequestDetails from './intercepted-request/InterceptedRequestDetails'

import { RequestCycle } from '../models'

import SetupIpcCommunication, { sendUpdatedProxyOptions, sendUpdatedContent } from './AppIpcCommunication'
import { RequestContent, ResponseContent, InterceptResult, InterceptAction, ContentType, AnyContent } from '../shared/modules'

class AppOptions {
  constructor(
    public isFingerprintEnabled: boolean = true,
    public isInterceptEnabled: boolean = false) { }
}

class AppState {
  constructor(
    public cycles: RequestCycle[] = [],
    public selectedCycle: RequestCycle | undefined = undefined,
    // Associated cycles contains all requests under `selectedCycle` path
    public associatedCycles: RequestCycle[] = [],
    public interceptedRequests: Array<AnyContent> = [],
    public options: AppOptions = new AppOptions()) { }
}

type SelectCycleHandler = (selectedCycleId: string, associatedRequestsIds: string[]) => void
type ToolbarActionHandler = (action: ToolbarAction) => void

const App = () => {
  const [appState, setAppState] = useState(new AppState())
  const [selectedCycleHandler, toolbarActionHandler, interceptHandler] = setupAppHandlers(appState, setAppState)

  SetupIpcCommunication(setAppState, appState.options)

  return (
    <>
      <Toolbar isFingerprintEnabled={appState.options.isFingerprintEnabled}
               isInterceptEnabled={appState.options.isInterceptEnabled}
               handler={toolbarActionHandler} />
      <SplitPane initialWidth={300} minWidth={300} maxWidth={500}>
        <RequestsSidebar cycles={appState.cycles} selectionHandler={selectedCycleHandler} />
        <RequestDetailsPane appState={appState} interceptHandler={interceptHandler} />
      </SplitPane>
    </>
  )
}

/**
 * Defines based on the `AppState` which will be shown on the right pane of the application
 */
const RequestDetailsPane = (props: { appState: AppState, interceptHandler: InterceptResult }) => {
  const hasInterceptedContent = props.appState.interceptedRequests.length > 0
  const interceptedContent = props.appState.interceptedRequests[0]

  const hasSelectedRequest: boolean = props.appState.selectedCycle !== undefined
  const isSingleRequest: boolean = props.appState.selectedCycle !== undefined && props.appState.associatedCycles.length === 0

  return (
    hasInterceptedContent ?
      <InterceptedRequestDetails content={interceptedContent} handler={props.interceptHandler} /> :
      isSingleRequest ?
        <SingleRequestDetails selectedCycle={props.appState.selectedCycle!} /> :
        hasSelectedRequest ?
          <RequestsDetails cycles={props.appState.associatedCycles.concat([props.appState.selectedCycle!])} /> :
          <RequestsDetails cycles={props.appState.cycles} />
  )
}

function setupAppHandlers(appState: AppState, setAppState: SetAppState): [SelectCycleHandler, ToolbarActionHandler, InterceptResult] {
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
    const options = appState.options

    switch (action) {
      case ToolbarAction.clear:
        setAppState(state => {
          return { ...state, cycles: [], selectedCycle: undefined, associatedCycles: [] }
        })
        break
      case ToolbarAction.fingerprintToggled:
        options.isFingerprintEnabled = !options.isFingerprintEnabled
        sendUpdatedProxyOptions(setAppState, options.isFingerprintEnabled, options.isInterceptEnabled)
        setAppState(state => {
          return { ...state, options }
        })
        break
      case ToolbarAction.interceptToggled:
        options.isInterceptEnabled = !options.isInterceptEnabled
        sendUpdatedProxyOptions(setAppState, options.isFingerprintEnabled, options.isInterceptEnabled)
        setAppState(state => {
          return { ...state, options }
        })
        break
    }
  }

  const interceptHandler = (action: InterceptAction, contentType: ContentType, updatedContent: RequestContent | ResponseContent) => {
    const payload = {
      action: InterceptAction[action],
      contentType: ContentType[contentType],
      updatedContent
    }
    sendUpdatedContent(payload, setAppState)
  }

  return [selectedCycleHandler, toolbarActionHandler, interceptHandler]
}

export default App
export { AppState, AppOptions }
export type SetAppState = React.Dispatch<React.SetStateAction<AppState>>