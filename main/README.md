# Main Module

The main module represents the `Electron` module of the application. It perform OS-related tasks - like intercepting the machine requests.

## Proxy Module

The proxy module uses [Hoxy](https://github.com/greim/hoxy) library to intercept the requests and responses. 

The requests are intercepted on the `request` phase, i.e, **before** they leave the user machine. At this scenario we can freely edit the request data and then send it to the destination.

On the same way, responses are intercepted on the `response` phase, i.e, before the response is received by the origin application. At this phase is also possible to edit the response content before the application gets it.