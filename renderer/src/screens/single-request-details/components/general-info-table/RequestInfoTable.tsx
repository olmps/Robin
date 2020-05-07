import React from 'react'

import { RequestCycle, HttpStatusCode } from '../../../../models'

import './RequestInfoTable.css'
import { rawMethod } from '../../../../models/request'

export const RequestInfoTable = (props: { request: RequestCycle }) => {
  const formattedStatusCode = props.request.statusCode !== undefined ?
    `${props.request.statusCode} - ${HttpStatusCode[props.request.statusCode]}` :
    "Waiting Response"
  return (
    <div className="RequestInfoTable">
      <table>
        <tbody>
          <tr>
            <th>URL</th>
            <td>{props.request.fullUrl}</td>
          </tr>
          <tr>
            <th>Status Code</th>
            <td>{formattedStatusCode}</td>
          </tr>
          <tr>
            <th>Protocol</th>
            <td>{props.request.request.protocol.toUpperCase()}</td>
          </tr>
          <tr>
            <th>Method</th>
            <td>{rawMethod(props.request.method)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default RequestInfoTable