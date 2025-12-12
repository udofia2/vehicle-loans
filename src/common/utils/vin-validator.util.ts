export class VinValidatorUtil {
  private static readonly VIN_REGEX = /^[A-HJ-NPR-Z0-9]{17}$/;
  private static readonly WEIGHTS = [
    8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2,
  ];
  private static readonly VALUES: { [key: string]: number } = {
    A: 1,
    B: 2,
    C: 3,
    D: 4,
    E: 5,
    F: 6,
    G: 7,
    H: 8,
    J: 1,
    K: 2,
    L: 3,
    M: 4,
    N: 5,
    P: 7,
    R: 9,
    S: 2,
    T: 3,
    U: 4,
    V: 5,
    W: 6,
    X: 7,
    Y: 8,
    Z: 9,
    '0': 0,
    '1': 1,
    '2': 2,
    '3': 3,
    '4': 4,
    '5': 5,
    '6': 6,
    '7': 7,
    '8': 8,
    '9': 9,
  };

  /**
   * Validate VIN format and check digit
   */
  static validateVin(vin: string): { isValid: boolean; reason?: string } {
    if (!vin) {
      return { isValid: false, reason: 'VIN is required' };
    }

    if (vin.length !== 17) {
      return {
        isValid: false,
        reason: 'VIN must be exactly 17 characters long',
      };
    }

    if (!this.VIN_REGEX.test(vin)) {
      return {
        isValid: false,
        reason: 'VIN contains invalid characters (I, O, Q are not allowed)',
      };
    }

    const checkDigitValid = this.validateCheckDigit(vin);
    if (!checkDigitValid) {
      return {
        isValid: false,
        reason:
          'VIN check digit validation failed. Please verify the VIN is correct - the 9th character (check digit) does not match the calculated value for this VIN.',
      };
    }

    return { isValid: true };
  }

  /**
   * Extract manufacturer from VIN (World Manufacturer Identifier)
   */
  static getManufacturerFromVin(vin: string): string | null {
    if (!this.validateVin(vin).isValid) {
      return null;
    }

    const wmi = vin.substring(0, 3);

    // Common WMI mappings (partial list)
    const wmiMap: { [key: string]: string } = {
      '1G1': 'Chevrolet',
      '1G6': 'Cadillac',
      '1FA': 'Ford',
      '1FT': 'Ford',
      '1GC': 'Chevrolet',
      '1HG': 'Honda',
      '1J4': 'Jeep',
      '1N4': 'Nissan',
      '2G1': 'Chevrolet',
      '2HG': 'Honda',
      '3FA': 'Ford',
      '3G1': 'Chevrolet',
      '4F2': 'Mazda',
      '4T1': 'Toyota',
      JM1: 'Mazda',
      JTD: 'Toyota',
      KM8: 'Hyundai',
      KNA: 'Kia',
      VWV: 'Volkswagen',
      WBA: 'BMW',
      WDB: 'Mercedes-Benz',
      YV1: 'Volvo',
    };

    return wmiMap[wmi] || null;
  }

  /**
   * Extract model year from VIN
   */
  static getModelYearFromVin(vin: string): number | null {
    if (!this.validateVin(vin).isValid) {
      return null;
    }

    const yearChar = vin.charAt(9);

    // Years 1980-2009 and 2010-2039 cycle
    const year1980to2009: { [key: string]: number } = {
      A: 1980,
      B: 1981,
      C: 1982,
      D: 1983,
      E: 1984,
      F: 1985,
      G: 1986,
      H: 1987,
      J: 1988,
      K: 1989,
      L: 1990,
      M: 1991,
      N: 1992,
      P: 1993,
      R: 1994,
      S: 1995,
      T: 1996,
      V: 1997,
      W: 1998,
      X: 1999,
      Y: 2000,
    };

    const year2001to2009: { [key: string]: number } = {
      '1': 2001,
      '2': 2002,
      '3': 2003,
      '4': 2004,
      '5': 2005,
      '6': 2006,
      '7': 2007,
      '8': 2008,
      '9': 2009,
    };

    const year2010to2039: { [key: string]: number } = {
      A: 2010,
      B: 2011,
      C: 2012,
      D: 2013,
      E: 2014,
      F: 2015,
      G: 2016,
      H: 2017,
      J: 2018,
      K: 2019,
      L: 2020,
      M: 2021,
      N: 2022,
      P: 2023,
      R: 2024,
      S: 2025,
      T: 2026,
      V: 2027,
      W: 2028,
      X: 2029,
      Y: 2030,
    };

    // Check numeric years first (2001-2009)
    if (year2001to2009[yearChar]) {
      return year2001to2009[yearChar];
    }

    // Check letter years
    const currentYear = new Date().getFullYear();

    // If it's a current/recent year, use 2010+ mapping
    if (
      year2010to2039[yearChar] &&
      year2010to2039[yearChar] <= currentYear + 2
    ) {
      return year2010to2039[yearChar];
    }

    // Otherwise use 1980+ mapping
    if (year1980to2009[yearChar]) {
      return year1980to2009[yearChar];
    }

    return null;
  }

  private static validateCheckDigit(vin: string): boolean {
    let sum = 0;

    for (let i = 0; i < 17; i++) {
      if (i === 8) continue; // Skip check digit position

      const char = vin.charAt(i);
      const value = this.VALUES[char];
      const weight = this.WEIGHTS[i];

      sum += value * weight;
    }

    const checkDigit = sum % 11;
    const expectedCheckDigit = checkDigit === 10 ? 'X' : checkDigit.toString();

    return vin.charAt(8) === expectedCheckDigit;
  }
}
