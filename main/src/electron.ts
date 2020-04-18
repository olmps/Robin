import { BrowserWindow, app } from 'electron';
import * as isDev from "electron-is-dev";
import * as path from 'path'
import createProxyHandler from './proxy/proxy';
import { NetworkRequest } from '../../shared/models/request';

let mainWindow: BrowserWindow
let proxyServer = createProxyHandler({ listenPort: 8080, excludedExtensions: [] })
let didSetupListener: boolean = false

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

function setupProxyListeners() {
    mainWindow.webContents.on('did-finish-load', () => {
        // 'did-finish-load' may be called multiple times when debugging with React Hot Reload
        if (!didSetupListener) {
            didSetupListener = true
            proxyServer.on('new-request', (request: NetworkRequest) => {
                mainWindow.webContents.send('proxy-new-request', request)
            })
        }
    })
}

app.allowRendererProcessReuse = true
app.on('ready', () => {
    startWindow()
    setupProxyListeners()
})