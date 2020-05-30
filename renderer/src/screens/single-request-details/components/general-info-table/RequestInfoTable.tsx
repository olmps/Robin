import React from 'react'

import { RequestCycle, HttpStatusCode } from '../../../../models'

import './RequestInfoTable.css'
import '../../../../extensions/number'

export const RequestInfoTable = (props: { request: RequestCycle }) => {
  const formattedStatusCode = props.request.statusCode !== undefined ?
    `${props.request.statusCode} - ${HttpStatusCode[props.request.statusCode]}` :
    "Waiting Response"
  const responseSize = props.request.response?.size ?? 0

  return (
    <div className="RequestInfoTable">
      <table>
        <tbody>
          <Row title="URL" content={props.request.fullUrl} />
          <Row title="Status Code" content={formattedStatusCode} />
          <Row title="Protocol" content={props.request.request.protocol.slice(0, -1).toUpperCase()} />
          <Row title="Method" content={props.request.request.rawMethod} />
          <Header title="Sizes" />
          <Row title="Request Size" content={props.request.request.size.sizeFormatted()} />
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
    <h3>{props.title}</h3>
  )
}

export default RequestInfoTable