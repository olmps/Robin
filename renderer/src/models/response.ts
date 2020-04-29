export class Response {
    /** HTTP status code being sent to the client. */
    statusCode: number

    /**
     * HTTP response header name/value JS object. Header names are all-lowercase,
     * such as 'content-type'.
     */
    headers: Map<string, string>

    /** Response body parsed as string. */
    body: string

    constructor(statusCode: number, headers: Map<string, string>, body: string) {
        this.statusCode = statusCode
        this.headers = headers
        this.body = body
    }

    static fromJson(responseJson: any): Response {
        const { statusCode, headers, body } = responseJson
        
        let formattedHeaders = new Map<string, string>()
        Object.keys(headers).forEach(key => {
            formattedHeaders.set(key, headers[key])
        })

        return new Response(statusCode, formattedHeaders, body)
    }

    size(): number {
        let size = 0
        size += this.statusCode.toString().length
        if (this.body) { size += this.body.length }

        return size
    }
}