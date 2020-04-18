import * as hoxy from 'hoxy'
import * as fs from 'fs'
import * as events from 'events'
import { ProxyConfig } from './proxy-config'
import { NetworkRequest, createNetworkRequest } from '../../../shared/models/request'

class ProxyHandler extends events.EventEmitter {
    config: ProxyConfig
  
    constructor(config: ProxyConfig) {
        super()
        this.config = config
        this.startProxyServer()
  }

  startProxyServer() {
    const proxyServer = hoxy.createServer({
        certAuthority: {
            key: fs.readFileSync(`src/resources/certificates/my-private-root-ca.key.pem`),
            cert: fs.readFileSync(`src/resources/certificates/my-private-root-ca.crt.pem`)
          }
    })
    proxyServer.log('error warn', (event: any) => {
        // Fallback to "socket hang up" error
        // ENOTFOUND means the target URL was not found -> it may not exists and DNS couldn't resolve it
        if (event.code === 'ENOTFOUND') return
        console.warn('hoxy error: ', event.code, event)
    });

    proxyServer.listen(8080)

    proxyServer.intercept('request', (req) => this._onInterceptRequest(req))
  }

  // Sanitize the received request
  async _onInterceptRequest(request: hoxy.Request) {
    const parsedRequest = new NetworkRequest(
      request.hostname,
      request.url,
      createNetworkRequest(request.method)
    )
    this.emit('new-request', parsedRequest)
  }
}

export default function createProxyHandler(config: ProxyConfig) {
  return new ProxyHandler(config)
}