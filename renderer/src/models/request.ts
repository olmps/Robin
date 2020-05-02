export enum Method {
    get, put, post, patch, delete
}

export function createRequestMethod(rawMethod: string): Method {
    switch (rawMethod) {
        case "GET": return Method.get
        case "POST": return Method.post
        case "PUT": return Method.put
        case "DELETE": return Method.delete
        case "PATCH": return Method.patch
    }

    return Method.get
}

export function rawMethod(method: Method): string {
    switch (method) {
        case Method.get: return "GET"
        case Method.post: return "POST"
        case Method.put: return "PUT"
        case Method.delete: return "DELETE"
        case Method.patch: return "PATCH"
    }
}

export class Request {
    /** Protocol of the request */
    protocol: string

    /** Destination server hostname, sans port */
    hostname: string

    /** Destination server port */
    port: number

    /** All-caps HTTP method used. Lowercase values are converted to uppercase */
    method: Method

    /** HTTP request header name/value JS object. These are all-lowercase, e.g. accept-encoding */
    headers: Map<string, string>

    /** Root-relative request URL, including body string, like /foo/bar?baz=qux */
    url: string

    /**
     * An object representing querystring params in the URL.
     * For example if the URL is /foo/bar?baz=qux, then this
     * map will look like { baz: 'qux' }.
     */
    query: Map<string, string>

    /** Request body parsed as String. */
    body?: string
    
    get fullUrl(): string { return `${this.hostname}${this.url}` }

    // Transient properties
    isNewRequest: boolean = true

    private constructor(protocol: string, hostname: string, 
                        port: number, method: Method,
                        headers: Map<string, string>, url: string, 
                        query: Map<string, string>, body?: string) {
        this.protocol = protocol
        this.hostname = hostname
        this.port = port
        this.method = method
        this.headers = headers
        this.url = url
        this.query = query
        this.body = body
    }

    static fromJson(requestJson: any): Request {
        const { protocol, hostname, port, method, headers, url, query, body } = requestJson
        
        let formattedHeaders = new Map<string, string>()
        Object.keys(headers).forEach(key => {
            formattedHeaders.set(key, headers[key])
        })
        
        let formattedQueries = new Map<string, string>()
        Object.keys(query).forEach(key => {
            formattedHeaders.set(key, query[key])
        })

        return new Request(protocol, hostname, port, createRequestMethod(method), formattedHeaders, url, formattedQueries, body)
    }

    size(): number {
        let size = 0
        size += this.protocol.length
        size += this.hostname.length
        size += rawMethod(this.method).length
        this.headers.forEach((key, value) => {
            size += key.length
            size += value.length
        })
        size += this.url.length
        this.query.forEach((key, value) => {
            size += key.length
            size += value.length
        })
        if (this.body) { size += this.body.length }

        return size
    }
}