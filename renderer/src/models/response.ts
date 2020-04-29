export class Response {
    /**
     * HTTP status code being sent to the client.
     */
    statusCode: number

    /**
     * HTTP response header name/value JS object. Header names are all-lowercase,
     * such as 'content-type'.
     */
    headers: Map<string, string>

    /**
     * Response body parsed as string.
     */
    body: string

    constructor(statusCode: number, headers: Map<string, string>, body: string) {
        this.statusCode = statusCode
        this.headers = headers
        this.body = body
    }

    static fromJson(responseJson: any): Response {
        const { statusCode, headers, json } = responseJson

        return new Response(statusCode, headers, json)
    }
}