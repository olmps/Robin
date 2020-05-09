import React from 'react'
import { UnControlled as CodeMirror } from 'react-codemirror2'

import './RequestContainer.css'

require('codemirror/lib/codemirror.css')
require('codemirror/theme/material.css')
require('codemirror/theme/seti.css')
require('codemirror/mode/http/http.js')

// Request Types
interface RequestContent { rawMethod: string, path: string, headers: Map<string, string>, body?: string }
type RequestContentHandler = (result: RequestContent) => void

// Response Types
interface ResponseContent { status: string, statusCode: number, headers: Map<string, string>, body?: string }
type ResponseContentHandler = (result: ResponseContent) => void

enum ContentType {
  request, response
}

interface ContainerProps {
  content: RequestContent | ResponseContent
  readOnly: boolean
  handler?: RequestContentHandler | ResponseContentHandler
}

const RequestContainer: React.FunctionComponent<ContainerProps> = (props) => {

  let content = ""
  let type: ContentType

  if ('rawMethod' in props.content) { // It's a request
    content = `${props.content.rawMethod} ${props.content.path} HTTP/1.1\n` // TODO: GET HTTP MODE FROM REQUEST
    type = ContentType.request
  } else {
    content = `HTTP/1.1 ${props.content.status} ${props.content.statusCode}\n` // TODO: GET HTTP MODE FROM REQUEST
    type = ContentType.response
  }

  props.content.headers.forEach((value, key) => {
    content += `${key}: ${value}\n`
  })
  if (props.content.body) { content += props.content.body }

  return (
    <div className="ContentWrapper">
      <CodeMirror
        className="CodeMirror"
        value={content}
        options={{
          readOnly: props.readOnly,
          mode: 'http',
          theme: 'seti',
          lineWrapping: true,
          lineNumbers: true
        }}
        onChange={(editor, data, value) => { if (props.handler) { handleChanges(value, type, props.handler) } }}
      />
    </div>
  )
}

function handleChanges(newValue: string, type: ContentType, handler: RequestContentHandler | ResponseContentHandler) {
  switch (type) {
    case ContentType.request: handleRequestChanges(newValue, handler as RequestContentHandler)
    case ContentType.response: handleResponseChanges(newValue, handler as ResponseContentHandler)
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
function handleRequestChanges(newValue: string, handler: RequestContentHandler) {
  let requestLines = newValue.split('\n')

  const requestMethodAndPath = requestLines[0]
  const rawMethod = requestMethodAndPath.split(' ')[0]
  const path = requestMethodAndPath.split(' ')[1]
  requestLines.shift() // Removes first line

  let headers = new Map<string, string>()
  let isReadingBody = false
  let body = ""

  for (const line of requestLines) {
    if (line === "") {
      isReadingBody = true
      continue
    }
    if (!isReadingBody) {
      const key = line.split(':')[0]
      const value = line.split(':')[1]
      headers.set(key, value)
    }

    body += `\n${line}`
  }

  const newContent = { rawMethod, path, headers, body }
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
function handleResponseChanges(newValue: string, handler: ResponseContentHandler) {
  let responseLines = newValue.split('\n')

  const splitStatusLine = responseLines[0].split(' ')
  splitStatusLine.shift() // Ignore protocol

  const statusCode = Number(splitStatusLine[0])
  splitStatusLine.shift()

  const status = splitStatusLine.reduce((accumulator, current) => accumulator + ` ${current}`, "")

  responseLines.shift()

  let headers = new Map<string, string>()

  for (const line of responseLines) {
    const key = line.split(':')[0]
    const value = line.split(':')[1]
    headers.set(key, value)
  }

  const newContent = { status, statusCode, headers }
  handler(newContent)
}

export default RequestContainer