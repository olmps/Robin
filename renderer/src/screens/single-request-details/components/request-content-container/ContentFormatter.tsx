import React from 'react'
import * as xmlFormatter from 'xml-formatter'

enum ContentType {
  json, form, xml, text
}

export function syntaxHighlighted(body: string) {
  const type = contentType(body)
  switch (type) {
    case ContentType.json: return formatJson(body)
    case ContentType.form: return formatFormUrlEncoded(body)
    case ContentType.xml: return formatXml(body)
    case ContentType.text: return <span>{body}</span>
  }
}

/**
 * Uses Regex, JSON and 3rd party libraries to determine the content type
 * based on the request body
 */
function contentType(body: string) {
  const formRegex = new RegExp("((\w+)=(\w*))+(&((\w+)=(\w*))+)*")
  if (body.match(formRegex)) { return ContentType.form }

  // Note that on this regex we are also matching HTML content-format. But we don't mind
  // since we are formatting XML and HTML in the same way
  const xmlRegex = new RegExp("(\<(.+)\>)(.*)(\<\/(.+)\>)")
  if (body.match(xmlRegex)) { return ContentType.xml }

  try {
    JSON.parse(body)
    return ContentType.json
  } catch { }
  
  return ContentType.text
} 

/** FORMATTERS */

function formatJson(json: string) {
  const formattedJson = JSON.stringify(JSON.parse(json), undefined, 2)
  
  let elements: JSX.Element[] = []
  let currentText = ""
  let isKey = false
  let key = 0

  for (var i = 0; i < formattedJson.length; i++) {
    const targetChar = formattedJson.charAt(i)

    if (targetChar === "\"" && !isKey) {
      elements.push(<span key={key}>{currentText}</span>)
      key += 1
      currentText = targetChar
      isKey = true
    } else if (targetChar === "\"" && isKey) {
      currentText += targetChar
      elements.push(<span key={key} className="JsonKey">{currentText}</span>)
      key += 1
      isKey = false
      currentText = ""
    } else {
      currentText += targetChar
    }
  }

  elements.push(<span>{currentText}</span>)
  
  return elements
}

function formatFormUrlEncoded(form: string) {
  let elements: JSX.Element[] = []
  let currentText = ""
  let key = 0

  for (var i = 0; i < form.length; i++) {
    const targetChar = form.charAt(i)

    if (targetChar === "=") {
      elements.push(<span key={key} className="FormKey">{currentText}</span>)
      key += 1
      elements.push(<span key={key} >{targetChar}</span>)
      key += 1
      currentText = ""
    } else if (targetChar === "&") {
      elements.push(<span key={key} className="FormValue">{currentText}</span>)
      key += 1
      elements.push(<span key={key}>{targetChar}</span>)
      key += 1
      currentText = ""
    } else {
      currentText += targetChar
    }
  }

  elements.push(<span className="FormValue">{currentText}</span>)
  
  return elements
}

function formatXml(xml: string) {
  const formattedXml = xmlFormatter.default(xml)
  let elements: JSX.Element[] = []
  let currentText = ""
  let key = 0

  for (var i = 0; i < formattedXml.length; i++) {
    const targetChar = formattedXml.charAt(i)

    if (targetChar === "<") {
      currentText += targetChar
      if (formattedXml.charAt(i + 1) === "/") {
        currentText += formattedXml.charAt(i + 1)
        i++
      }
      elements.push(<span key={key}>{currentText}</span>)
      key += 1
      currentText = ""
    } else if (targetChar === ">") {
      elements.push(<span key={key} className="XmlTag">{currentText}</span>)
      key += 1
      currentText = targetChar
    } else {
      currentText += targetChar
    }
  }

  elements.push(<span key={key}>{currentText}</span>)
  
  return elements
}