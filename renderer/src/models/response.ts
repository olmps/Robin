import HttpStatusCode from "./status-code"

export type HeaderValue = string | string[]

export class Response {
  /** Id from the wrapper cycle */
  cycleId: string

  /** HTTP status code being sent to the client. */
  statusCode: number

  /**
   * HTTP response header name/value JS object. Header names are all-lowercase,
   * such as 'content-type'.
   */
  headers: Record<string, HeaderValue>

  /** Response body parsed as string. */
  body: string

  /** Response size in bytes */
  size: number

  get status(): string { return HttpStatusCode[this.statusCode] }

  constructor(cycleId: string, statusCode: number, headers: Record<string, HeaderValue>, body: string, size: number) {
    this.cycleId = cycleId
    this.statusCode = statusCode
    this.headers = headers
    this.body = body
    this.size = size
  }

  static fromJson(responseJson: any): Response {
    const { cycleId, statusCode, headers, body, size } = responseJson
    return new Response(cycleId, statusCode, headers, body, size)
  }
}