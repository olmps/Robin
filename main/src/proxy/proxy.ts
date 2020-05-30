import * as Sniffer from 'web-proxy-sniffer'
import { uuid } from 'uuidv4'
import * as fs from 'fs'
import { ProxyConfig } from './proxy-config'
import { exec } from 'child_process'
import GeoIpHandler from '../geoip/geoip'
import { UpdatedContent, RequestContent, ResponseContent } from '../shared/modules'

type RequestHandler = (payload: any) => Promise<UpdatedContent>

export class ProxyHandler {
  config: ProxyConfig
  proxyServer: Sniffer.Proxy

  // Handlers
  newRequestHandler: RequestHandler
  updateRequestHandler: RequestHandler

  constructor(config: ProxyConfig, newRequestHandler: RequestHandler, updateRequestHandler: RequestHandler) {
    this.config = config
    this.newRequestHandler = newRequestHandler
    this.updateRequestHandler = updateRequestHandler

    this.proxyServer = Sniffer.createServer({
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
      console.log("[PROXY ERROR] " + JSON.stringify(error))
    })

    this.proxyServer.listen(this.config.listenPort)
    
    this.proxyServer.intercept({ phase: 'request' }, (req, res) => this.onInterceptRequest(req))
    this.proxyServer.intercept({ phase: 'response' }, (req, res) => this.onInterceptResponse(req, res))
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
  private async onInterceptRequest(request: Sniffer.IRequest): Promise<Sniffer.IRequest> {
    request.id = uuid()
    request.started = new Date().getTime()

    const { protocol, hostname, port, method, headers, url, query, stringBody, size } = request

    const formattedRequest = { cycleId: request.id, protocol, hostname, port, method, headers, url, query, size, body: stringBody }

    const payload = {
      id: request.id,
      requestPayload: formattedRequest
    }

    if (this.config.isInterceptEnabled) {
      try {
        const modifiedRequest = await this.newRequestHandler(payload)
        if (modifiedRequest.action === 'drop') { return Promise.reject() }

        const updatedContent = modifiedRequest.updatedContent as RequestContent

        request.method = updatedContent.method
        request.headers = updatedContent.headers
        request.url = updatedContent.path
        request.string = updatedContent.body
        
        return Promise.resolve(request)

      } catch (error) {
        console.log("[PROXY ERROR] Error while sending modified request: " + error)
        return Promise.reject()
      }
    } else {
      this.newRequestHandler(payload)
      return Promise.resolve(request)
    }
  }

  private async onInterceptResponse(request: Sniffer.IRequest, response: Sniffer.IResponse): Promise<Sniffer.IResponse> {
    const requestId = request.id
    const duration = new Date().getTime() - request.started

    const { statusCode, headers, size, stringBody } = response

    const formattedResponse = { cycleId: requestId, statusCode, headers, size, body: stringBody }

    let geoLocation: any = {}

    try {
      const source = await GeoIpHandler.getCurrentLocation()
      const destination = GeoIpHandler.getGeoLocation(response.remoteAddress)

      geoLocation.source = source
      geoLocation.destination = destination
    } catch (error) {
      console.error(error)
    }

    const payload = {
      id: requestId,
      responsePayload: formattedResponse,
      duration,
      geoLocation
    }

    if (this.config.isInterceptEnabled) {
      try {
        const modifiedResponse = await this.updateRequestHandler(payload)
        if (modifiedResponse.action === 'drop') { return Promise.reject() }

        const updatedContent = modifiedResponse.updatedContent as ResponseContent

        response.statusCode = updatedContent.statusCode
        response.headers = updatedContent.headers
        response.string = updatedContent.body

        return Promise.resolve(response)
      } catch (error) {
        console.log("[PROXY ERROR] Error while sending modified response: " + error)
        return Promise.reject()
      }
    } else {
      this.updateRequestHandler(payload)
      return Promise.resolve(response)
    }
  }
}

export default function createProxyHandler(config: ProxyConfig, newRequestHandler: RequestHandler, updateRequestHandler: RequestHandler) {
  return new ProxyHandler(config, newRequestHandler, updateRequestHandler)
}