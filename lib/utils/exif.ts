/**
 * EXIF data parsing utilities
 */

export interface ParsedExif {
  camera?: {
    make?: string;
    model?: string;
  };
  settings?: {
    iso?: number;
    aperture?: string;
    shutterSpeed?: string;
    focalLength?: string;
  };
  dateTaken?: string;
  location?: {
    latitude?: number;
    longitude?: number;
  };
  other?: Record<string, any>;
}

/**
 * Parse EXIF JSON data into structured format
 */
export function parseExif(exifJson: Record<string, any> | undefined | null): ParsedExif | null {
  if (!exifJson || typeof exifJson !== "object") {
    return null;
  }

  const parsed: ParsedExif = {
    other: {},
  };

  // Camera info
  if (exifJson.Make || exifJson.Model) {
    parsed.camera = {
      make: exifJson.Make,
      model: exifJson.Model,
    };
  }

  // Shooting settings
  const iso = exifJson.ISO || exifJson.ISOSpeedRatings;
  const aperture = exifJson.FNumber || exifJson.ApertureValue;
  const shutterSpeed = exifJson.ExposureTime || exifJson.ShutterSpeedValue;
  const focalLength = exifJson.FocalLength;

  if (iso || aperture || shutterSpeed || focalLength) {
    parsed.settings = {};
    if (iso) parsed.settings.iso = typeof iso === "number" ? iso : parseFloat(iso);
    if (aperture) {
      const fNumber = typeof aperture === "number" ? aperture : parseFloat(aperture);
      parsed.settings.aperture = `f/${fNumber.toFixed(1)}`;
    }
    if (shutterSpeed) {
      const speed = typeof shutterSpeed === "number" ? shutterSpeed : parseFloat(shutterSpeed);
      if (speed < 1) {
        parsed.settings.shutterSpeed = `1/${Math.round(1 / speed)}s`;
      } else {
        parsed.settings.shutterSpeed = `${speed.toFixed(1)}s`;
      }
    }
    if (focalLength) {
      const focal = typeof focalLength === "number" ? focalLength : parseFloat(focalLength);
      parsed.settings.focalLength = `${Math.round(focal)}mm`;
    }
  }

  // Date taken
  if (exifJson.DateTimeOriginal || exifJson.DateTime) {
    parsed.dateTaken = exifJson.DateTimeOriginal || exifJson.DateTime;
  }

  // GPS location
  if (exifJson.GPSLatitude && exifJson.GPSLongitude) {
    const lat = typeof exifJson.GPSLatitude === "number" 
      ? exifJson.GPSLatitude 
      : parseFloat(exifJson.GPSLatitude);
    const lon = typeof exifJson.GPSLongitude === "number"
      ? exifJson.GPSLongitude
      : parseFloat(exifJson.GPSLongitude);
    
    if (!isNaN(lat) && !isNaN(lon)) {
      parsed.location = {
        latitude: lat,
        longitude: lon,
      };
    }
  }

  // Store other fields
  const knownFields = new Set([
    "Make", "Model", "ISO", "ISOSpeedRatings", "FNumber", "ApertureValue",
    "ExposureTime", "ShutterSpeedValue", "FocalLength", "DateTimeOriginal",
    "DateTime", "GPSLatitude", "GPSLongitude",
  ]);

  for (const [key, value] of Object.entries(exifJson)) {
    if (!knownFields.has(key)) {
      parsed.other![key] = value;
    }
  }

  // Return null if no meaningful data was parsed
  if (!parsed.camera && !parsed.settings && !parsed.dateTaken && !parsed.location) {
    return null;
  }

  return parsed;
}

/**
 * Format GPS coordinates for display
 */
export function formatGPSLocation(latitude: number, longitude: number): string {
  return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
}

/**
 * Generate Google Maps URL from GPS coordinates
 */
export function getGoogleMapsUrl(latitude: number, longitude: number): string {
  return `https://www.google.com/maps?q=${latitude},${longitude}`;
}

