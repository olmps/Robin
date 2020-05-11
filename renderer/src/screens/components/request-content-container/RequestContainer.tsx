import React from 'react'
import { UnControlled as CodeMirror } from 'react-codemirror2'

import { RequestContent, ResponseContent, ContentType } from '../../../shared/modules'

import './RequestContainer.css'
import { HttpStatusCode } from '../../../models'

require('codemirror/lib/codemirror.css')
require('codemirror/theme/material.css')
require('codemirror/theme/seti.css')
require('codemirror/mode/http/http.js')

type RequestContentHandler = (result: RequestContent) => void
type ResponseContentHandler = (result: ResponseContent) => void

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

  props.content.headers.forEach((value, key) => {
    rawContent += `${key}: ${value}\n`
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
      handleRequestChanges(newValue, cycleId, handler as RequestContentHandler)
      break
    case ContentType.response: 
      handleResponseChanges(newValue, cycleId, handler as ResponseContentHandler)
      break
  }
}

/**
 * Handle request changes on the textarea editor.
 * 
 * We are expecting a request with a valid raw format, i.e:
 * 
 *    <METHOD> <PATH> <PROTOCOL>
 *    [<HEADER>]
 *    
 *    <BODY>
 *    
 * Any changes to this content format will - and must - create an invalid request.
 */
function handleRequestChanges(newValue: string, cycleId: string, handler: RequestContentHandler) {
  let requestLines = newValue.split('\n')

  const requestMethodAndPath = requestLines[0]
  const rawMethod = requestMethodAndPath.split(' ')[0]
  const path = requestMethodAndPath.split(' ')[1]
  requestLines.shift() // Removes first line

  const headerRegex = new RegExp('([a-zA-Z0-9-_]+):(.*)')
  const headers = new Map<string, string>()
  let isReadingBody = false
  let body = ""

  for (const line of requestLines) {
    if (line === "" || !headerRegex.test(line)) {
      isReadingBody = true
      continue
    }
    if (!isReadingBody) {
      const key = line.split(':')[0]
      const value = line.split(':')[1].trim()
      headers.set(key, value)
    } else {
      body += `\n${line}`
    }
  }

  const newContent = { cycleId, type: 'request', method: rawMethod, path, headers, body }
  handler(newContent)
}

/**
 * Handle response changes on the textarea editor.
 * 
 * We are expecting a response with a valid raw format, i.e:
 * 
 *    <PROTOCOL> <STATUS CODE> <STATUS NAME>
 *    [<HEADER>]
 *    
 * Any changes to this content format will - and must - create an invalid response.
 */
function handleResponseChanges(newValue: string, cycleId: string, handler: ResponseContentHandler) {
  let responseLines = newValue.split('\n')

  const splitStatusLine = responseLines[0].split(' ')
  splitStatusLine.shift() // Ignore protocol
  
  const statusCode = Number(splitStatusLine[0])

  responseLines.shift()

  let headers = new Map<string, string>()

  for (const line of responseLines) {
    const key = line.split(':')[0]
    const value = line.split(':')[1]
    headers.set(key, value)
  }

  const newContent = { cycleId, type: 'response', statusCode, headers }
  handler(newContent)
}

export default RequestContainer