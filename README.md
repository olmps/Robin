# Robin - A Web Security Tool

Robin is a Web Security debugging tool built using `Electron` and `React JS`. We propose it as a **FREE** and OpenSource alternative to the known web debugging tools.

## Installing
---

Choose the OS and download the latest release

[![All platforms download](https://img.shields.io/badge/download-any_platform-green.svg)](https://github.com/olmps/Robin/releases/latest)

## Modules
---

The codebase is divided in two main modules: `main` and `renderer`.

### Main

The `main` module represents the `Electron` app. It wraps the React application and is responsible for making OS-level tasks.

## Renderer

The `renderer` module represents the `React` app. It includes all the application interface and is responsible for presentation and user-interaction tasks.

## Enabled HTTPS
---

If you run `Robin` and your browser show scary messages about the traffic, you need to trust Robins certificate to intercept and inspect HTTPS traffic. Robin uses a wildcard certificate and performs a Man In the Middle between the request origin and its destination. In order to perform these MITM, you need to trust Robin's wildcard certificate. Follow these steps to enable HTTPS traffic intercept:

### MacOS
1. Install the certificate by double-tapping the certificate and its key at `main/src/resources/certificates/`
2. Open the `Keychain Access`
3. Right click `Robin Certificate` and tap `Get Info`
4. Under `Trust` section, chose `Always Trust`
5. When close the window, confirm the trust settings
6. All done.

## Contributing
---

### Setting up the Environment
```bash
# Clone the repository
git clone https://github.com/olmps/Robin
cd Robin

# Install all modules dependencies
npm run install-dependencies

# Start the app
npm run start
```

By default, the application automatically turn on the proxy settings on `macOS` environment. But you can manually enable/disable this settings on `System Preferences -> Network -> Advanced -> Proxies`.

To turn the proxy on, the server specs must follow:

- Web Proxy (HTTP): 127.0.0.1 : 8080
- Secure Web Proxy (HTTPS): 127.0.0.1 : 8080

### If after closing the application / debug session you appear to be without network connection, it may be the case that the application failed to disable the proxy settings on the machine. Follow the steps above to manually turn it off.

### Read the [Contributing Guidelines](./CONTRIBUTING.MD)