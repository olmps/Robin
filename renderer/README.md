# Renderer Module

The renderer module represents the `React` module of the application. It presents the application interface to the user and handle with the uer interactions through the application.

## Communication

It communicates with the `Main` module through `Electron ipcRenderer` module. This communication is made through `src/AppIpcCommunication.tsx`. All the communication between the modules is `asynchronous`.