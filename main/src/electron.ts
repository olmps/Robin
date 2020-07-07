import { BrowserWindow, app, ipcMain } from 'electron'
import * as path from 'path'
import * as url from 'url'
import createProxyHandler, { ProxyHandler } from './proxy/proxy'
import { UpdatedContent, IPCMessageChannel } from './shared'

let mainWindow: BrowserWindow
let proxyServer: ProxyHandler
let oneTimeSetup: boolean = false

function startWindow() {
  mainWindow = new BrowserWindow({
    title: 'Robin',
    width: 900,
    height: 680,
    minWidth: 850,
    minHeight: 600,
    backgroundColor: '#FFFFFF',
    webPreferences: {
      nodeIntegration: true
    }
  })

  const isDev = process.env.NODE_ENV == 'dev'

  mainWindow.loadURL(
    isDev
      ? "http://localhost:3000"
      : url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true,
      })
  )

  if (isDev) { mainWindow.webContents.openDevTools() }

  mainWindow.on("closed", () => mainWindow.destroy())
}

/**
 * Setup modules that can only be setup once. Proxy modules and IPC listeners are
 * examples of one-time modules
 */
function setupOneTimeModules() {
  mainWindow.webContents.on('did-finish-load', () => {
    if (!oneTimeSetup) {
      setupProxy()
      setupAppListeners()
      oneTimeSetup = true
    }
  })
}

function setupProxy() {
  const requestHandler = (requestPayload: any) => {
    return new Promise<UpdatedContent>((resolve, _) => {
      const updatedRequestChannel = IPCMessageChannel.updatedRequest(requestPayload.id)
      ipcMain.on(updatedRequestChannel, (_, payload: UpdatedContent) => {
        ipcMain.removeAllListeners(updatedRequestChannel)
        resolve(payload)
      })
      mainWindow.webContents.send(IPCMessageChannel.proxyNewRequest, requestPayload)
    })
  }
  const responseHandler = (responsePayload: any) => {
    const updatedResponseChannel = IPCMessageChannel.updatedResponse(responsePayload.id)
    return new Promise<UpdatedContent>((resolve, _) => {
      ipcMain.on(updatedResponseChannel, (_, payload: UpdatedContent) => {
        ipcMain.removeAllListeners(updatedResponseChannel)
        resolve(payload)
      })
      mainWindow.webContents.send(IPCMessageChannel.proxyNewResponse, responsePayload)
    })
  }
  const proxyOptions = {
    isProxyEnabled: true, 
    isInterceptEnabled: false, 
    listenPort: 8080,
    excludedExtensions: []
  }
  
  proxyServer = createProxyHandler(proxyOptions, requestHandler, responseHandler)
}

function setupAppListeners() {
  ipcMain.on(IPCMessageChannel.proxyOptionsUpdated, (_, payload: any) => {
    proxyServer.proxyConfigUpdated(payload)
  })
}

app.allowRendererProcessReuse = true

app.on('ready', () => {
  startWindow()
  setupOneTimeModules()
})

app.on('quit', () => {
  proxyServer.stopProxyServer()
})