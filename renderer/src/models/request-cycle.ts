import { Request, Method, Response } from "./index"

class GeoLocationData {
  constructor(public latitude: number, public longitude: number) { }

  public toString = (): string => `${this.latitude};${this.longitude}`
}

export class GeoLocation {
  constructor(public source: GeoLocationData, public destination: GeoLocationData) { }

  static fromJson(json: any): GeoLocation | undefined {
    const { source, destination } = json
    if (!source || !destination) { return undefined }

    const sourceLocation = new GeoLocationData(source.latitude, source.longitude)
    const destinationLocation = new GeoLocationData(destination.latitude, destination.longitude)

    return new GeoLocation(sourceLocation, destinationLocation)
  }

  public toString = (): string => {
    const sourceIdentifier = `source:${this.source.latitude};${this.source.longitude}`
    const destinationIdentifier = `destination:${this.destination.latitude};${this.destination.longitude}`
    return `${sourceIdentifier};${destinationIdentifier}`
  }
}

/**
 * Represents an entire Request-Response cycle.
 */
export class RequestCycle {
  id: string
  request: Request
  // A response may not exists because the cycle may not be complete yet, i.e, it's the response
  response?: Response
  duration: number
  /// GeoLocation may not exists if a DNS resolve operations fails, for example
  geoLocation?: GeoLocation

  get fullUrl(): string { return `${this.request.hostname}${this.request.url}` }
  get url(): string { return this.request.url }
  get hostname(): string { return this.request.hostname }
  get method(): Method { return this.request.method }
  get statusCode(): number | undefined {
    if (!this.response) { return undefined }
    return this.response.statusCode
  }
  get isComplete(): boolean {
    return this.response !== undefined
  }
  get isSecure(): boolean {
    return this.request.protocol === "https:"
  }

  constructor(id: string, request: Request, duration: number, geoLocation?: GeoLocation, response?: Response) {
    this.id = id
    this.request = request
    this.response = response
    this.duration = duration
    this.geoLocation = geoLocation
  }

  /**
   * Calculates the size - in bytes - of the entire request cycle.
   * If the cycle has no response yet, return just the request size.
   */
  size(): number {
    let size = this.request.size
    if (this.response) { size += this.response.size }
    return size
  }
}