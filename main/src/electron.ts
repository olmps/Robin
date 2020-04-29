import { BrowserWindow, app } from 'electron';
import * as isDev from "electron-is-dev";
import * as path from 'path'
import createProxyHandler from './proxy/proxy';

let mainWindow: BrowserWindow
let proxyServer = createProxyHandler({ listenPort: 8080, excludedExtensions: [] })
let didSetupListeners: boolean = false

function startWindow() {
    mainWindow = new BrowserWindow({
        minWidth: 800,
        minHeight: 600,
        width: 900,
        height: 680,
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

function setupProxyListeners() {
    mainWindow.webContents.on('did-finish-load', () => {
        // 'did-finish-load' may be called multiple times when debugging with React Hot Reload
        if (!didSetupListeners) {
            didSetupListeners = true
            proxyServer.on('new-request', (requestPayload: any) => {
                mainWindow.webContents.send('proxy-new-request', requestPayload)
            })
            proxyServer.on('new-response', (responsePayload: any) => {
                mainWindow.webContents.send('proxy-new-response', responsePayload)
            })
        }
    })
}

app.allowRendererProcessReuse = true
app.on('ready', () => {
    startWindow()
    setupProxyListeners()
})

app.on('quit', () => {
    proxyServer.stopProxyServer()
})