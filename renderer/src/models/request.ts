enum NetworkRequestMethod {
    get, put, post
}

export function createNetworkRequestMethod(request: string): NetworkRequestMethod {
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
    
    get fullUrl(): string { return `${this.domain}${this.url}` }

    // Transient properties
    isNewRequest: boolean = true

    constructor(domain: string, url: string, method: NetworkRequestMethod, createdAt: Date) {
        this.domain = domain
        this.url = url
        this.method = method
        this.createdAt = createdAt
    }

    static fromJson(json: any): NetworkRequest {
        const { domain, url, method, createdAt } = json
        const formattedMethod = createNetworkRequestMethod(method)
        const formattedCreatedAt = new Date(createdAt)

        return new NetworkRequest(domain, url, formattedMethod, formattedCreatedAt)
    }
}