import * as hoxy from 'hoxy'
import { uuid } from 'uuidv4'
import * as fs from 'fs'
import * as events from 'events'
import { ProxyConfig } from './proxy-config'
import { exec } from 'child_process'
import GeoIpHandler from '../geoip/geoip'

class ProxyHandler extends events.EventEmitter {
    config: ProxyConfig

    // TODO: Docs
    ongoingRequests: Map<string, number>
  
    constructor(config: ProxyConfig) {
        super()
        this.config = config
        this.ongoingRequests = new Map<string, number>()
        this.startProxyServer()
  }

  startProxyServer() {
    this._turnProxySettingsOn(this.config.listenPort)
    const proxyServer = hoxy.createServer({
        certAuthority: {
            key: fs.readFileSync(`src/resources/certificates/proxy-cert-key.key.pem`),
            cert: fs.readFileSync(`src/resources/certificates/proxy-cert.crt.pem`)
          }
    })

    proxyServer.on('error', (error: any) => {
      // Fallback for DNS resolve issues.
      // ENOTFOUND means the target URL was not found -> it may not exists or DNS couldn't resolve it
      if (error.code === 'ENOTFOUND ENOTFOUND') return
      // Fallback to "socket hang up" error
      // The socket cannot was interrupted for an unknown reason. This doesn't affect the application behavior
      if (error.code === 'ECONNRESET') return
      console.error('hoxy error: ', error)
    })

    proxyServer.listen(8080)

    proxyServer.intercept({ phase: 'request', as: 'string'}, (req) => this._onInterceptRequest(req))
    proxyServer.intercept({ phase: 'response', as: 'string'}, (req, res) => this._onInterceptResponse(req, res))
  }

  stopProxyServer() {
    if (process.platform === 'darwin') {
      exec(`networksetup -setwebproxystate Wi-Fi off`)
      exec(`networksetup -setsecurewebproxystate Wi-Fi off`)
    }
  }

  _turnProxySettingsOn(port: number) {
    if (process.platform === 'darwin') {
      exec(`networksetup -setwebproxy Wi-Fi 127.0.0.1 ${port}`)
      exec(`networksetup -setsecurewebproxy Wi-Fi 127.0.0.1 ${port}`)
      exec(`networksetup -setwebproxystate Wi-Fi on`)
      exec(`networksetup -setsecurewebproxystate Wi-Fi on`)
    }
  }

  // Intercept the request before it's sent to the destination.
  // The user may modify the request content before it's sent.
  async _onInterceptRequest(request: any) {
    request.id = uuid()
    request.started = new Date().getTime()

    const { protocol, hostname, port, method, headers, url, query } = request
    const formattedRequest = { id: request.id, protocol, hostname, port, method, headers, url, query, body: request.string! }
    
    let geoLocation: any = { }

    try {
      const source = await GeoIpHandler.getCurrentLocation()
      const destination = await GeoIpHandler.geoLocation(hostname)

      geoLocation.source = source
      geoLocation.destination = destination
    } catch { } // We don't care for errors because there's nothing we can do as a fallback

    const payload = {
      id: request.id,
      requestPayload: formattedRequest,
      geoLocation
    }

    this.emit('new-request', payload)
  }

  _onInterceptResponse(request: any, response: hoxy.Response) {
    const requestId = request.id
    const cycleDuration = new Date().getTime() - request.started

    const { statusCode, headers } = response
    const formattedResponse = { id: requestId, duration: cycleDuration, statusCode, headers, body: response.string! }
    
    this.emit('new-response', formattedResponse)
  }
}

export default function createProxyHandler(config: ProxyConfig) {
  return new ProxyHandler(config)
}