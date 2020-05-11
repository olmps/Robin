import { BrowserWindow, app, ipcMain, ipcRenderer } from 'electron'
import * as isDev from "electron-is-dev"
import * as path from 'path'
import createProxyHandler, { ProxyHandler } from './proxy/proxy'

// TODO: REMOVE THIS WORKAROUND
interface RequestContent { method: string, path: string, headers: Map<string, string>, body?: string }
interface ResponseContent { status: string, statusCode: number, headers: Map<string, string>, body?: string }
interface UpdatedContent { action: string, contentType: string, updatedContent: RequestContent | ResponseContent }

let mainWindow: BrowserWindow
let proxyServer: ProxyHandler
let didSetup: boolean = false

function startWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 680,
    minWidth: 850,
    minHeight: 600,
    backgroundColor: '#FFFFFF',
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

function setupProxyAndListeners() {
  mainWindow.webContents.on('did-finish-load', () => {
    if (!didSetup) {
      setupProxy()
      setupAppListeners()
      didSetup = true
    }
  })
}

function setupProxy() {
  const requestHandler = (requestPayload: any) => {
    return new Promise<UpdatedContent>((resolve, _) => {
      ipcMain.on(`updated-request-${requestPayload.id}`, (_, payload: UpdatedContent) => {
        ipcMain.removeAllListeners(`updated-request-${requestPayload.id}`)
        resolve(payload)
      })
      mainWindow.webContents.send('proxy-new-request', requestPayload)
    })
  }
  const responseHandler = (responsePayload: any) => {
    return new Promise<UpdatedContent>((resolve, _) => {
      ipcMain.on(`updated-response-${responsePayload.id}`, (_, payload: UpdatedContent) => {
        ipcMain.removeAllListeners(`updated-response-${responsePayload.id}`)
        resolve(payload)
      })
      mainWindow.webContents.send('proxy-new-response', responsePayload)
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

/// Setup Listeners for the React module
function setupAppListeners() {
  ipcMain.on('proxy-options-updated', (_, payload: any) => {
    proxyServer.proxyConfigUpdated(payload)
  })
}

app.allowRendererProcessReuse = true

app.on('ready', () => {
  startWindow()
  setupProxyAndListeners()
})

app.on('quit', () => {
  proxyServer.stopProxyServer()
})