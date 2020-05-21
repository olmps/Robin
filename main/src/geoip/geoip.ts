import * as geoIp from 'geoip-lite'
import * as publicIp from 'public-ip'

class GeoLocation {
  constructor(public latitude: number, public longitude: number) {}
}

export default class GeoIpHandler {
  
  /**
   * Get current location based on the user public IPV4 address.
   */
  static async getCurrentLocation() {
    const userPublicIp = await publicIp.v4()
    const userGeoLocation = geoIp.lookup(userPublicIp)
    if (userGeoLocation) {
      return new GeoLocation(userGeoLocation.ll[0], userGeoLocation.ll[1])
    }
    
    throw new Error(`Failed to retrieve user geolocation from public ip address ${userPublicIp}`)
  }

  /**
   * Get GeoLocation for an ip address
   */
  static getGeoLocation(ipAddress: string): GeoLocation {
    const geoData = geoIp.lookup(ipAddress)
    if (geoData) {
      return new GeoLocation(geoData.ll[0], geoData.ll[1])
    }
    
    throw new Error(`Failed to retrieve geolocation from ip address ${ipAddress}`)
  }
}