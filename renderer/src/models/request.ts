export enum Method {
  get, put, post, patch, delete
}

function createRequestMethod(rawMethod: string): Method {
  switch (rawMethod) {
    case "GET": return Method.get
    case "POST": return Method.post
    case "PUT": return Method.put
    case "DELETE": return Method.delete
    case "PATCH": return Method.patch
  }

  return Method.get
}

function rawMethod(method: Method): string {
  switch (method) {
    case Method.get: return "GET"
    case Method.post: return "POST"
    case Method.put: return "PUT"
    case Method.delete: return "DELETE"
    case Method.patch: return "PATCH"
  }
}

export type HeaderValue = string | string[]

export class Request {
  /** Id from the wrapper cycle */
  cycleId: string

  /** Protocol of the request */
  protocol: string

  /** Destination server hostname, sans port */
  hostname: string

  /** Destination server port */
  port: number

  /** All-caps HTTP method used. Lowercase values are converted to uppercase */
  method: Method

  /** HTTP request header name/value JS object. These are all-lowercase, e.g. accept-encoding */
  headers: Record<string, HeaderValue>

  /** Root-relative request URL, including body string, like /foo/bar?baz=qux */
  url: string

  /**
   * An object representing querystring params in the URL.
   * For example if the URL is /foo/bar?baz=qux, then this
   * map will look like { baz: 'qux' }.
   */
  query: Record<string, string>

  /** Request body parsed as String. */
  body?: string

  /** Request size in bytes */
  size: number

  get fullUrl(): string { return `${this.hostname}${this.url}` }
  get rawMethod(): string { return rawMethod(this.method) }

  // Transient properties
  isNewRequest: boolean = true

  private constructor(cycleId: string, protocol: string, hostname: string,
                      port: number, method: Method, headers: Record<string, HeaderValue>,
                      url: string, query: Record<string, string>, size: number,
                      body?: string) {
    this.cycleId = cycleId
    this.protocol = protocol
    this.hostname = hostname
    this.port = port
    this.method = method
    this.headers = headers
    this.url = url
    this.query = query
    this.body = body
    this.size = size
  }

  static fromJson(requestJson: any): Request {
    const { cycleId, protocol, hostname, port, method, headers, url, query, size, body } = requestJson

    return new Request(cycleId, protocol, hostname, port, createRequestMethod(method), headers, url, query, size, body)
  }

  setRequestMethod(method: string) {
    this.method = createRequestMethod(method)
  }
}