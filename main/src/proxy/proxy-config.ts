enum FileExtension {
  png, jpg, gif, css, js, ico
}

export class ProxyConfig {
  constructor(
    public isProxyEnabled: boolean = true,
    public isInterceptEnabled: boolean = false,
    public listenPort: number, 
    public excludedExtensions: FileExtension[]) { }
}