import * as hoxy from 'hoxy'
import * as fs from 'fs'
import * as events from 'events'
import { ProxyConfig } from './proxy-config'
import { NetworkRequest, createNetworkRequestMethod } from '../../../shared/models/request'

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
    proxyServer.on('error', (error: any) => {
        console.error('hoxy error: ', error)
        // Fallback to "socket hang up" error
        // ENOTFOUND means the target URL was not found -> it may not exists and DNS couldn't resolve it
        if (error.code === 'ENOTFOUND') return
    })

    proxyServer.log('error warn debug', (evt: any) => {
      console.error('Hoxy Error')
      console.error(evt)
    })

    proxyServer.listen(8080)

    proxyServer.intercept('request', (req) => this._onInterceptRequest(req))
  }

  // Sanitize the received request
  async _onInterceptRequest(request: hoxy.Request) {
    const formattedRequest = {
      domain: request.hostname,
      url: request.url,
      method: createNetworkRequestMethod(request.method),
      createdAt: new Date().toDateString()
    }
    
    this.emit('new-request', formattedRequest)
  }
}

export default function createProxyHandler(config: ProxyConfig) {
  return new ProxyHandler(config)
}