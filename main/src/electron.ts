import { BrowserWindow, app, ipcMain } from 'electron'
import * as isDev from "electron-is-dev"
import * as path from 'path'
import createProxyHandler from './proxy/proxy'
import GeoIpHandler from './geoip/geoip'

let mainWindow: BrowserWindow
let proxyServer = createProxyHandler({ listenPort: 8080, excludedExtensions: [] })
let didSetupListeners: boolean = false

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

function setupListeners() {
    mainWindow.webContents.on('did-finish-load', () => {
        if (!didSetupListeners) {
            setupProxyListeners()
            didSetupListeners = true
        }
    })
}

function setupProxyListeners() {
    proxyServer.on('new-request', (requestPayload: any) => {
        mainWindow.webContents.send('proxy-new-request', requestPayload)
    })
    proxyServer.on('new-response', (responsePayload: any) => {
        mainWindow.webContents.send('proxy-new-response', responsePayload)
    })
}

app.allowRendererProcessReuse = true
app.on('ready', () => {
    startWindow()
    setupListeners()
})

app.on('quit', () => {
    proxyServer.stopProxyServer()
})