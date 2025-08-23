export interface GeoData {
  country: string;
  countryCode: string;
  region: string;
  city: string;
  timezone: string;
  isp: string;
  organization: string;
  asn: string;
  latitude: number;
  longitude: number;
}

export class GeoService {
  /**
   * Get geographic information by IP address
   */
  static async getGeoByIP(ip: string): Promise<GeoData | null> {
    try {
      // Use free IP geolocation service
      const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,timezone,isp,org,as,lat,lon`);
      const data = await response.json();

      if (data.status === 'success') {
        return {
          country: data.country || 'Unknown',
          countryCode: data.countryCode || 'XX',
          region: data.regionName || 'Unknown',
          city: data.city || 'Unknown',
          timezone: data.timezone || 'UTC',
          isp: data.isp || 'Unknown',
          organization: data.org || 'Unknown',
          asn: data.as || 'Unknown',
          latitude: data.lat || 0,
          longitude: data.lon || 0
        };
      }

      return null;
    } catch (error) {
      console.error('GeoService error:', error);
      return null;
    }
  }

  /**
   * Get country flag emoji by country code
   */
  static getCountryFlag(countryCode: string): string {
    if (!countryCode || countryCode.length !== 2) {return '🏳️';}

    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));

    return String.fromCodePoint(...codePoints);
  }

  /**
   * Check if IP is from a VPN/Proxy service
   */
  static async checkVPN(ip: string): Promise<boolean> {
    try {
      // Use VPN detection service (example with proxycheck.io)
      const response = await fetch(`http://proxycheck.io/v2/${ip}?key=demo&vpn=1&asn=1`);
      const data = await response.json();

      if (data[ip]) {
        return data[ip].proxy === 'yes' || data[ip].type === 'VPN';
      }

      return false;
    } catch (error) {
      console.error('VPN check error:', error);
      return false;
    }
  }

  /**
   * Get ISP information by IP
   */
  static async getISPInfo(ip: string): Promise<{ isp: string; organization: string; asn: string } | null> {
    try {
      const geoData = await this.getGeoByIP(ip);

      if (geoData) {
        return {
          isp: geoData.isp,
          organization: geoData.organization,
          asn: geoData.asn
        };
      }

      return null;
    } catch (error) {
      console.error('ISP info error:', error);
      return null;
    }
  }

  /**
   * Validate geographic consistency
   */
  static validateGeoConsistency(reported: { country?: string; timezone?: string }, detected: GeoData): boolean {
    // Check if reported country matches detected country
    if (reported.country && detected.country) {
      if (reported.country.toLowerCase() !== detected.country.toLowerCase()) {
        return false;
      }
    }

    // Check timezone consistency
    if (reported.timezone && detected.timezone) {
      if (reported.timezone !== detected.timezone) {
        return false;
      }
    }

    return true;
  }

  /**
   * Calculate distance between two geographic points
   */
  static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Get mobile carrier information (placeholder)
   */
  static async getMobileCarrier(ip: string): Promise<string | null> {
    try {
      // This would require specialized mobile carrier detection API
      // For now, return null or implement with third-party service
      return null;
    } catch (error) {
      console.error('Mobile carrier detection error:', error);
      return null;
    }
  }

  /**
   * Detect connection type based on IP and user agent
   */
  static detectConnectionType(ip: string, userAgent: string): string {
    const ua = userAgent?.toLowerCase() || '';

    // Mobile detection
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return 'mobile';
    }

    // WiFi detection (simplified)
    if (ua.includes('wifi')) {
      return 'wifi';
    }

    // Default to cable/broadband
    return 'cable';
  }
}
