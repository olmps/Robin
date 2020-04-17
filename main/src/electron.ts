import { BrowserWindow, app } from 'electron' ; 
import * as isDev from "electron-is-dev" ; 
import * as path from 'path'
import * as fs from 'fs'
import * as hoxy from 'hoxy'

let mainWindow: BrowserWindow

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
    const proxy = hoxy.createServer({
        certAuthority: {
            key: fs.readFileSync(`${__dirname}/my-private-root-ca.key.pem`),
            cert: fs.readFileSync(`${__dirname}/my-private-root-ca.crt.pem`)
          }
    }).listen(8080)

    mainWindow.webContents.on('did-finish-load', () => {
        proxy.intercept('request', (req, res, cycle) => {
            mainWindow.webContents.send('proxy-new-request', { headers: req.headers, protocol: req.protocol, hostname: req.hostname, method: req.method, url: req.url });
        });
    });
}

app.allowRendererProcessReuse = true
app.on('ready', () => {
    startWindow()
    startProxy()
})