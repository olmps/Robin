/// IPC Messages channels

export class IPCMessageChannel {
  static proxyOptionsUpdated = "proxy-options-updated"
  static proxyNewRequest = "proxy-new-request"
  static proxyNewResponse = "proxy-new-response"

  static updatedRequest(cycleId: string) { return `updated-request-${cycleId}` }
  static updatedResponse(cycleId: string) { return `updated-response-${cycleId}` }
}