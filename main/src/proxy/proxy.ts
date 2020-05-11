import * as hoxy from 'hoxy'
import { uuid } from 'uuidv4'
import * as fs from 'fs'
import { ProxyConfig } from './proxy-config'
import { exec } from 'child_process'
import GeoIpHandler from '../geoip/geoip'
import { UpdatedContent, RequestContent, ResponseContent } from '../shared/modules'

type RequestHandler = (payload: any) => Promise<UpdatedContent>

export class ProxyHandler {
  config: ProxyConfig
  proxyServer: hoxy.Proxy

  // Handlers
  newRequestHandler: RequestHandler
  updateRequestHandler: RequestHandler

  constructor(config: ProxyConfig, newRequestHandler: RequestHandler, updateRequestHandler: RequestHandler) {
    this.config = config
    this.newRequestHandler = newRequestHandler
    this.updateRequestHandler = updateRequestHandler

    this.proxyServer = hoxy.createServer({
      certAuthority: {
        key: fs.readFileSync(`src/resources/certificates/proxy-cert-key.key.pem`),
        cert: fs.readFileSync(`src/resources/certificates/proxy-cert.crt.pem`)
      }
    })

    if (config.isProxyEnabled) { this.startProxyServer() }
  }

  proxyConfigUpdated(newOptions: any) {
    if (this.config.isProxyEnabled !== newOptions.proxyEnabled) {
      this.config.isProxyEnabled = newOptions.proxyEnabled
      this.toggleProxyStatus()
    }
    this.config.isInterceptEnabled = newOptions.interceptEnabled
  }

  private toggleProxyStatus() {
    if (this.config.isProxyEnabled) {
      this.startProxyServer()
    } else {
      this.stopProxyServer()
    }
  }

  stopProxyServer() {
    this.proxyServer.close()
    if (process.platform === 'darwin') {
      exec(`networksetup -setwebproxystate Wi-Fi off`)
      exec(`networksetup -setsecurewebproxystate Wi-Fi off`)
    }
  }

  private startProxyServer() {
    this.turnProxySettingsOn(this.config.listenPort)

    this.proxyServer.on('error', (error: any) => {
      // Fallback for DNS resolve issues.
      // ENOTFOUND means the target URL was not found -> it may not exists or DNS couldn't resolve it
      if (error.code === 'ENOTFOUND ENOTFOUND') return
      // Fallback to "socket hang up" error
      // The socket cannot was interrupted for an unknown reason. This doesn't affect the application behavior
      if (error.code === 'ECONNRESET') return
      console.error("Hoxy Error: " + JSON.stringify(error))
    })

    try {
      this.proxyServer.listen(this.config.listenPort)
    } catch (error) {
      // This shouldn't be happening, but hoxy has a bug on `.close()` function
      // and this error happens when trying to start the proxy again. We have
      // a task to create our own proxy module, so this buggy hoxy errors handling
      // will be removed in the future
      if (error.code === "ERR_SERVER_ALREADY_LISTEN") return
      console.error("Hoxy Error: ", JSON.stringify(error))
    }

    this.proxyServer.intercept({ phase: 'request', as: 'string' }, (req) => this.onInterceptRequest(req))
    this.proxyServer.intercept({ phase: 'response', as: 'string' }, (req, res) => this.onInterceptResponse(req, res))
  }

  private turnProxySettingsOn(port: number) {
    if (process.platform === 'darwin') {
      exec(`networksetup -setwebproxy Wi-Fi 127.0.0.1 ${port}`)
      exec(`networksetup -setsecurewebproxy Wi-Fi 127.0.0.1 ${port}`)
      exec(`networksetup -setwebproxystate Wi-Fi on`)
      exec(`networksetup -setsecurewebproxystate Wi-Fi on`)
    }
  }

  // Intercept the request before it's sent to the destination.
  // The user may modify the request content before it's sent.
  private async onInterceptRequest(request: any) {
    request.id = uuid()
    request.started = new Date().getTime()

    const { protocol, hostname, port, method, headers, url, query } = request

    let geoLocation: any = {}

    try {
      const source = await GeoIpHandler.getCurrentLocation()
      const destination = await GeoIpHandler.geoLocation(hostname)

      geoLocation.source = source
      geoLocation.destination = destination
    } catch { } // We don't care for errors because there's nothing we can do as a fallback

    request.geoLocation = geoLocation

    const formattedRequest = { cycleId: request.id, protocol, hostname, port, method, headers, url, query, body: request.string! }

    const payload = {
      id: request.id,
      requestPayload: formattedRequest,
      geoLocation
    }
    
    if (this.config.isInterceptEnabled) {
      const modifiedRequest = await this.newRequestHandler(payload)
      const updatedContent = modifiedRequest.updatedContent as RequestContent
      
      request.hostname = updatedContent.headers.get("host")?.trim()
      request.method = updatedContent.method
      request.headers = updatedContent.headers
      request.url = updatedContent.path
      request.string = updatedContent.body
    } else {
      this.newRequestHandler(payload)
    }
  }

  private async onInterceptResponse(request: any, response: any) {
    const requestId = request.id
    const duration = new Date().getTime() - request.started

    const { statusCode, headers } = response
    const formattedResponse = { cycleId: requestId, statusCode, headers, body: response.string! }

    const payload = {
      id: requestId,
      responsePayload: formattedResponse,
      duration
    }

    if (this.config.isInterceptEnabled) {
      const modifiedResponse = await this.updateRequestHandler(payload)
      const updatedContent = modifiedResponse.updatedContent as ResponseContent
      
      response.statusCode = updatedContent.statusCode
      response.headers = updatedContent.headers
      response.string = updatedContent.body
    } else {
      this.updateRequestHandler(payload)
    }
  }
}

export default function createProxyHandler(config: ProxyConfig, newRequestHandler: RequestHandler, updateRequestHandler: RequestHandler) {
  return new ProxyHandler(config, newRequestHandler, updateRequestHandler)
}