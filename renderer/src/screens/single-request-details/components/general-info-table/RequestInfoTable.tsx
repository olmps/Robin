import React from 'react'

import { RequestCycle, HttpStatusCode } from '../../../../models'

import './RequestInfoTable.css'
import '../../../../extensions/number'

export const RequestInfoTable = (props: { cycle: RequestCycle }) => {
  const formattedStatusCode = props.cycle.request.dropped ? "-" :
                              props.cycle.statusCode !== undefined ?
                                  `${props.cycle.statusCode} - ${HttpStatusCode[props.cycle.statusCode]}` :
                                  "Waiting Response"

  const formattedStatus = props.cycle.isComplete ? "Complete" :
                          props.cycle.request.dropped ? "Blocked" : "Waiting Response"
  const responseSize = props.cycle.response  !== undefined ? props.cycle.response.size : 0

  return (
    <div className="RequestInfoTable">
      <table>
        <tbody>
          <Row title="URL" content={props.cycle.fullUrl} />
          <Row title="Status" content={formattedStatus} />
          <Row title="Status Code" content={formattedStatusCode} />
          <Row title="Protocol" content={props.cycle.request.protocol.slice(0, -1).toUpperCase()} />
          <Row title="Method" content={props.cycle.request.rawMethod} />
          <Header title="Sizes" />
          <Row title="Request Size" content={props.cycle.request.size.sizeFormatted()} />
          <Row title="Response Size" content={responseSize.sizeFormatted()} />
        </tbody>
      </table>
    </div>
  )
}

const Row = (props: { title: string, content: string }) => {
  return (
    <tr>
      <th className="Underscored">{props.title}</th>
      <td className="Underscored">{props.content}</td>
    </tr>
  )
}

const Header = (props: { title: string }) => {
  return (
    <tr><th><h3>{props.title}</h3></th></tr>
  )
}

export default RequestInfoTable