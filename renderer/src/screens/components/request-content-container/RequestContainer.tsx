import React from 'react'
import { UnControlled as CodeMirror } from 'react-codemirror2'

import { RequestContent, ResponseContent, ContentType, HeaderValue } from '../../../shared/modules'

import './RequestContainer.css'
import { HttpStatusCode } from '../../../models'

require('codemirror/lib/codemirror.css')
require('codemirror/theme/material.css')
require('codemirror/theme/seti.css')
require('codemirror/mode/http/http.js')

type RequestContentHandler = (result: RequestContent) => void
type ResponseContentHandler = (result: ResponseContent) => void
type CommonContent = { headers: Record<string, HeaderValue>, body: string }

interface ContainerProps {
  content: RequestContent | ResponseContent
  type: ContentType
  readOnly: boolean
  handler?: RequestContentHandler | ResponseContentHandler
}

const RequestContainer: React.FunctionComponent<ContainerProps> = (props) => {

  let rawContent = ""
  
  switch (props.type) {
    case ContentType.request:
      const requestContent = props.content as RequestContent
      rawContent = `${requestContent.method} ${requestContent.path} HTTP/1.1\n` // TODO: GET HTTP MODE FROM REQUEST
      break
    case ContentType.response:
      const responseContent = props.content as ResponseContent
      const statusCode = responseContent.statusCode
      rawContent = `HTTP/1.1 ${statusCode} ${HttpStatusCode[statusCode]}\n` // TODO: GET HTTP MODE FROM REQUEST
  }

  Object.keys(props.content.headers).forEach((key) => {
    const headerValue = props.content.headers[key]
    if (typeof headerValue === 'string') {
      rawContent += `${key}: ${headerValue}\n`
    } else {
      headerValue.forEach(value => rawContent += `${key}: ${value}\n`)
    }
  })
  if (props.content.body) { rawContent += `\n${props.content.body}` }

  return (
    <div className="ContentWrapper">
      <CodeMirror
        className="CodeMirror"
        value={rawContent}
        options={{
          readOnly: props.readOnly,
          mode: 'http',
          theme: 'seti',
          lineWrapping: true,
          lineNumbers: true
        }}
        onChange={(editor, data, value) => { if (props.handler) { handleChanges(value, props.content.cycleId, props.type, props.handler) } }}
      />
    </div>
  )
}

function handleChanges(newValue: string, cycleId: string, type: ContentType, handler: RequestContentHandler | ResponseContentHandler) {
  switch (type) {
    case ContentType.request:
      const requestHandler = handler as RequestContentHandler
      const requestChanges = formatRequestChanges(newValue)
      requestChanges.cycleId = cycleId
      requestHandler(requestChanges)
      break
    case ContentType.response: 
      const responseHandler = handler as ResponseContentHandler
      const responseChanges = formatResponseChanges(newValue)
      responseChanges.cycleId = cycleId
      responseHandler(responseChanges)
      break
  }
}

/**
 * Handle request changes on the textarea editor.
 * 
 * A valid raw format is expected, i.e:
 * 
 *    <METHOD> <PATH> <PROTOCOL>
 *    [<HEADER>]
 *    
 *    <BODY>
 *    
 * Any changes to this content format will - and must - create an invalid request.
 */
function formatRequestChanges(newValue: string): any {
  let requestLines = newValue.split('\n')

  const requestMethodAndPath = requestLines[0]
  const rawMethod = requestMethodAndPath.split(' ')[0]
  const path = requestMethodAndPath.split(' ')[1]
  requestLines.shift() // Removes first line

  const commonChanges = handleCommonChanges(requestLines)

  return { type: 'request', method: rawMethod, path, headers: commonChanges.headers, body: commonChanges.body }
}

/**
 * Handle response changes on the textarea editor.
 * 
 * A valid raw format is expected, i.e:
 * 
 *    <PROTOCOL> <STATUS CODE> <STATUS NAME>
 *    [<HEADER>]
 * 
 *    <BODY>
 *    
 * Any changes to this content format will - and must - create an invalid response.
 */
function formatResponseChanges(newValue: string): any {
  let responseLines = newValue.split('\n')

  const splitStatusLine = responseLines[0].split(' ')
  splitStatusLine.shift() // Ignore protocol
  const statusCode = Number(splitStatusLine[0])
  responseLines.shift() // Removes first line

  const commonChanges = handleCommonChanges(responseLines)

  return { type: 'response', statusCode, headers: commonChanges.headers, body: commonChanges.body }
}

/**
 * Request and Response has the same structure except from the first line.
 * This function extract the headers and body from the text area editor.
 */
function handleCommonChanges(contentLines: string[]): CommonContent {
  const headerRegex = new RegExp('([a-zA-Z0-9-_]+):(.*)')
  let headers: Record<string, HeaderValue> = { }
  let isReadingBody = false
  let body = ""

  for (const line of contentLines) {
    if (line === "" || !headerRegex.test(line)) {
      isReadingBody = true
      continue
    }
    if (!isReadingBody) {
      const key = line.split(':')[0]
      const value = line.split(':')[1].trim()
      if (key in headers) {
        const values = headers[key] as string[]
        values.push(value)
        headers[key] = values
        continue
      }
      headers[key] = value
    } else {
      body += `\n${line}`
    }
  }

  return { headers, body }
}

export default RequestContainer