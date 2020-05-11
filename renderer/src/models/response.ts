import HttpStatusCode from "./status-code"

export class Response {
  /** Id from the wrapper cycle */
  cycleId: string

  /** HTTP status code being sent to the client. */
  statusCode: number

  /**
   * HTTP response header name/value JS object. Header names are all-lowercase,
   * such as 'content-type'.
   */
  headers: Map<string, string>

  /** Response body parsed as string. */
  body: string

  get status(): string { return HttpStatusCode[this.statusCode] }

  constructor(cycleId: string, statusCode: number, headers: Map<string, string>, body: string) {
    this.cycleId = cycleId
    this.statusCode = statusCode
    this.headers = headers
    this.body = body
  }

  static fromJson(responseJson: any): Response {
    const { cycleId, statusCode, headers, body } = responseJson

    let formattedHeaders = new Map<string, string>()
    Object.keys(headers).forEach(key => {
      formattedHeaders.set(key, headers[key])
    })

    return new Response(cycleId, statusCode, formattedHeaders, body)
  }

  size(): number {
    let size = 0
    size += this.statusCode.toString().length
    if (this.body) { size += this.body.length }

    return size
  }
}