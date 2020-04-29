enum FileExtension {
    png, jpg, gif, css, js, ico
}

export class ProxyConfig {
    listenPort: number
    excludedExtensions: FileExtension[]

    constructor(listenPort: number, excludedExtensions: FileExtension[]) {
        this.listenPort = listenPort
        this.excludedExtensions = excludedExtensions

    }
}