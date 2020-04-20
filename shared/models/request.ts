
enum NetworkRequestMethod {
    get, put, post
}

export function createNetworkRequest(request: string): NetworkRequestMethod {
    switch (request) {
        case "GET": return NetworkRequestMethod.get
        case "POST": return NetworkRequestMethod.post
        case "PUT": return NetworkRequestMethod.put
    }

    return NetworkRequestMethod.get
}

export class NetworkRequest {
    domain: string
    url: string
    method: NetworkRequestMethod
    createdAt: Date

    get key(): string { return this.createdAt.getTime().toString() }
    get fullUrl(): string { return `${this.domain}${this.url}` }

    // Transient properties
    isNewRequest: boolean = true

    constructor(domain: string, url: string, method: NetworkRequestMethod = NetworkRequestMethod.get) {
        this.domain = domain
        this.url = url
        this.method = method

        this.createdAt = new Date()
    }
}