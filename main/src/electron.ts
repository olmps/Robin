import { BrowserWindow, app } from 'electron' ; 
import * as isDev from "electron-is-dev" ; 
import * as path from 'path'
import * as fs from 'fs'
import * as hoxy from 'hoxy'

let mainWindow: BrowserWindow
let didSetupProxy: boolean = false

function startWindow() {
    mainWindow = new BrowserWindow({ 
        width: 900, 
        height: 680,
        webPreferences: {
            nodeIntegration: true,
        }
    })
    mainWindow.loadURL(
        isDev
            ? "http://localhost:3000"
            : `file://${path.join(__dirname, "../build/index.html")}`
    )

    if (isDev) { mainWindow.webContents.openDevTools() }

    mainWindow.on("closed", () => mainWindow.destroy())
}

function startProxy() {
    const proxyServer = hoxy.createServer({
        certAuthority: {
            key: fs.readFileSync(`${__dirname}/my-private-root-ca.key.pem`),
            cert: fs.readFileSync(`${__dirname}/my-private-root-ca.crt.pem`)
          }
    })

    proxyServer.on('error', (event: any) => {
        // Fallback to "socket hang up" error
        // ENOTFOUND means the target URL was not found -> it may not exists and DNS couldn't resolve it
        if (event.code === 'ENOTFOUND') return
        console.warn('hoxy error: ', event.code, event)
      });
  
    proxyServer.listen(8080)

    mainWindow.webContents.on('did-finish-load', () => {
        // 'did-finish-load' may be called multiple times when debugging with React Hot Reload
        if (!didSetupProxy) {
            didSetupProxy = true
            proxyServer.intercept('request', (req, res, cycle) => {
                mainWindow.webContents.send('proxy-new-request', { headers: req.headers, protocol: req.protocol, hostname: req.hostname, method: req.method, url: req.url });
            })
        }
    })
}

app.allowRendererProcessReuse = true
app.on('ready', () => {
    startWindow()
    startProxy()
})