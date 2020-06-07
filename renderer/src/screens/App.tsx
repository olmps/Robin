import React, { useState } from 'react'

import RequestsSidebar from './requests-sidebar/RequestsSidebar'
import RequestsDetails from './requests-details/RequestsDetails'
import SingleRequestDetails from './single-request-details/SingleRequestDetails'
import SplitPane from '../components/split-pane/SplitPane'
import InterceptedRequestDetails from './intercepted-request/InterceptedRequestDetails'

import { RequestCycle } from '../models'
import { DiscloseAction, DiscloseActionHandler } from '../components/disclosure-list/models'

import SetupIpcCommunication, { sendUpdatedProxyOptions, didUpdateContent } from './AppIpcCommunication'
import { RequestContent, ResponseContent, InterceptResult, InterceptAction, ContentType, AnyContent, UpdatedContent } from '../shared/modules'

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

const App = () => {
  const [appState, setAppState] = useState(new AppState())
  const [disclosureListHandler, interceptHandler] = setupAppHandlers(appState, setAppState)

  SetupIpcCommunication(setAppState, appState.options)

  return (
    <>
      <SplitPane initialWidth={300} minWidth={300} maxWidth={500}>
        <RequestsSidebar cycles={appState.cycles} actionHandler={disclosureListHandler} />
        <RequestDetailsPane appState={appState} interceptHandler={interceptHandler} />
      </SplitPane>
    </>
  )
}

/**
 * Defines based on the `AppState` which will be shown on the right pane of the application.
 * The importance order is defined as:
 *  1. Intercepted Request or Response
 *  2. A result based on a selection on the requests lists left pane
 *  3. A general overview from all requests
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

function setupAppHandlers(appState: AppState, setAppState: SetAppState): [DiscloseActionHandler, InterceptResult] {
  const disclosureListActionHandler = (action: DiscloseAction, content: any | undefined) => {
    const updatedOptions = appState.options

    switch (action) {
      case DiscloseAction.clear:
        setAppState({ ...appState, cycles: [], selectedCycle: undefined, associatedCycles: [] })
        break
      case DiscloseAction.select:
        const selectedCycleId: string = content[0]
        const associatedRequestsIds: string[] = content[1]

        const selectedCycle = appState.cycles.find(cycle => cycle.id === selectedCycleId)
        const associatedCycles = appState.cycles.filter(cycle => associatedRequestsIds.includes(cycle.id))
        setAppState({ ...appState, selectedCycle, associatedCycles })
        break
      case DiscloseAction.fingerprint:
        updatedOptions.isFingerprintEnabled = !updatedOptions.isFingerprintEnabled
        setAppState({ ...appState, options: updatedOptions })
        sendUpdatedProxyOptions(setAppState, updatedOptions.isFingerprintEnabled, updatedOptions.isInterceptEnabled)
        break
      case DiscloseAction.intercept:
        updatedOptions.isInterceptEnabled = !updatedOptions.isInterceptEnabled
        setAppState({ ...appState, options: updatedOptions })
        sendUpdatedProxyOptions(setAppState, updatedOptions.isFingerprintEnabled, updatedOptions.isInterceptEnabled)
        break
    }
  }

  const interceptHandler = (action: InterceptAction, contentType: ContentType, updatedContent: RequestContent | ResponseContent) => {
    const payload: UpdatedContent = {
      action: InterceptAction[action],
      type: ContentType[contentType],
      updatedContent
    }

    didUpdateContent(payload, setAppState)
  }

  return [disclosureListActionHandler, interceptHandler]
}

export default App
export { AppState, AppOptions }
export type SetAppState = React.Dispatch<React.SetStateAction<AppState>>