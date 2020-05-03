import React from 'react'

import { RequestCycle } from '../../../models'

import './RequestInfoTable.css'

export const RequestInfoTable = (props: { request: RequestCycle }) => {  
  return (
    <div className="RequestInfoTable">
      <table>
        <tr>
          <th>URL</th>
          <td>{props.request.fullUrl}</td>
        </tr>
        <tr>
          <th>Status Code</th>
          <td>{props.request.statusCode ?? "Waiting Response"}</td>
        </tr>
        <tr>
          <th>Protocol</th>
          <td>{props.request.request.protocol}</td>
        </tr>
        <tr>
          <th>Method</th>
          <td>{props.request.method}</td>
        </tr>
      </table>
    </div>
  )
}

export default RequestInfoTable