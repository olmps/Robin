import { Request, Method, Response } from "./index"
import HttpStatusCode from "./status-code"

/**
 * Represents an entire Request-Response cycle.
 */
export class RequestCycle {
    id: string
    request: Request
    // A response may not exists because the cycle may not be complete yet, i.e, it's the response
    response?: Response
    duration: number

    get fullUrl(): string { return `${this.request.hostname}${this.request.url}` }
    get url(): string { return this.request.url }
    get hostname(): string { return this.request.hostname }
    get method(): Method { return this.request.method }
    get statusCode(): number | undefined {
        if (!this.response) { return undefined }
        return this.response.statusCode
    }
    get isComplete(): boolean {
        // TODO: FIND A BETTER WAY TO HANDLE SOCKET CONNECTIONS
        return this.response !== undefined || this.fullUrl.includes('socket')
    }

    constructor(id: string, request: Request, duration: number, response?: Response) {
        this.id = id
        this.request = request
        this.response = response
        this.duration = duration
    }

    static fromJson(json: any): RequestCycle {
        const { id, requestJson, responseJson, duration } = json
        const request = Request.fromJson(requestJson)
        const response = Response.fromJson(responseJson)

        return new RequestCycle(id, request, duration, response)
    }

    /**
     * Calculates the size - in bytes - of the entire request cycle.
     * If the cycle has no response yet, return just the request size.
     */
    size(): number {
        let size = this.request.size()
        if (this.response) { size += this.response.size() }
        return size
    }
}