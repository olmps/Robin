import * as hoxy from 'hoxy'
import * as fs from 'fs'
import * as events from 'events'
import { ProxyConfig } from './proxy-config'

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
            key: fs.readFileSync(`src/resources/certificates/proxy-cert-key.key.pem`),
            cert: fs.readFileSync(`src/resources/certificates/proxy-cert.crt.pem`)
          }
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
      method: request.method,
      createdAt: new Date().toDateString()
    }
    
    this.emit('new-request', formattedRequest)
  }
}

export default function createProxyHandler(config: ProxyConfig) {
  return new ProxyHandler(config)
}