# Robin - A Web Security Tool

Robin is a Web Security debugging tool built using `Electron` and `React JS`. We propose it as a **FREE** and OpenSource alternative to the known web debugging tools.

## Installing
---

Choose your OS and download the latest release

[![All platforms download](https://img.shields.io/badge/download-any_platform-green.svg)](https://github.com/olmps/Robin/releases/latest)

## Modules
---

The codebase is divided in two main modules: `main` and `renderer`.

### Main

The `main` module represents the `Electron` app. It wraps the React application and is responsible for making OS-level tasks.

### Renderer

The `renderer` module represents the `React` app. It includes all the application interface and is responsible for presentation and user-interaction tasks.

## Enabling HTTPS
---

If you run `Robin` and your browser show scary messages about the traffic security, you need to trust Robin's certificate to intercept and inspect HTTPS traffic. Robin uses a wildcard certificate and performs a Man In the Middle (*MITM*) between the request origin and its destination. So, in order to perform these *MITM*, you need to trust Robin's wildcard certificate. Follow these steps to enable HTTPS traffic intercept:

### MacOS
1. Install the certificate by double-tapping the certificate and its key at `main/src/resources/certificates/`
2. Open the `Keychain Access`
3. Right click `Robin Certificate` and tap `Get Info`
4. Under `Trust` section, chose `Always Trust`
5. When close the window, confirm the trust settings
6. All done.

## Contributing
---

Any contribution is accepted, but we follow some [guidelines](./CONTRIBUTING.MD) to keep things running as best as we can!

### Setting up the Environment
```bash
# We'll clone the repository and cd into it
git clone https://github.com/olmps/Robin
cd Robin
# Then install both root and submodules' dependencies through NPM
npm i
# At last, we start the application
npm run start
```

### Proxy
By default, the application turns on the proxy settings on `macOS` environment automatically. To manually enable/disable this settings, go to `System Preferences -> Network -> Advanced -> Proxies`.
To turn the proxy on, the server specs must follow:
- Web Proxy (HTTP): 127.0.0.1 : 8080
- Secure Web Proxy (HTTPS): 127.0.0.1 : 8080

## Troubleshooting
---

Q: *After closing the application/debug session, it looks that I have lost network connection, why?*

A: There are cases where the application fails to disable the proxy settings. To solve this, you should follow the steps in the **Proxy** section above.