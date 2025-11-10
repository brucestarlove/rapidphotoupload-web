"use client";

import { parseExif, formatGPSLocation, getGoogleMapsUrl } from "@/lib/utils/exif";
import { Separator } from "@/components/ui/separator";
import { ExternalLink } from "lucide-react";
import type { PhotoMetadataResponse } from "@/types/api";

interface ExifDataProps {
  photo: PhotoMetadataResponse | null;
}

export function ExifData({ photo }: ExifDataProps) {
  if (!photo?.exifJson) {
    return (
      <div className="space-y-4">
        <Separator />
        <div>
          <h3 className="text-sm font-semibold mb-2">EXIF Data</h3>
          <p className="text-sm text-muted-foreground">No EXIF data available</p>
        </div>
      </div>
    );
  }

  const parsed = parseExif(photo.exifJson);

  if (!parsed) {
    return (
      <div className="space-y-4">
        <Separator />
        <div>
          <h3 className="text-sm font-semibold mb-2">EXIF Data</h3>
          <p className="text-sm text-muted-foreground">No EXIF data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Separator />
      <div>
        <h3 className="text-sm font-semibold mb-3">EXIF Data</h3>
        <div className="space-y-3 text-sm">
          {/* Camera Info */}
          {parsed.camera && (parsed.camera.make || parsed.camera.model) && (
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Camera
              </label>
              <p className="mt-1">
                {parsed.camera.make && parsed.camera.model
                  ? `${parsed.camera.make} ${parsed.camera.model}`
                  : parsed.camera.make || parsed.camera.model || "N/A"}
              </p>
            </div>
          )}

          {/* Shooting Settings */}
          {parsed.settings && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Shooting Settings
              </label>
              <div className="space-y-1">
                {parsed.settings.iso && (
                  <p>
                    <span className="text-muted-foreground">ISO:</span> {parsed.settings.iso}
                  </p>
                )}
                {parsed.settings.aperture && (
                  <p>
                    <span className="text-muted-foreground">Aperture:</span> {parsed.settings.aperture}
                  </p>
                )}
                {parsed.settings.shutterSpeed && (
                  <p>
                    <span className="text-muted-foreground">Shutter Speed:</span> {parsed.settings.shutterSpeed}
                  </p>
                )}
                {parsed.settings.focalLength && (
                  <p>
                    <span className="text-muted-foreground">Focal Length:</span> {parsed.settings.focalLength}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Date Taken */}
          {parsed.dateTaken && (
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Date Taken
              </label>
              <p className="mt-1">{parsed.dateTaken}</p>
            </div>
          )}

          {/* GPS Location */}
          {parsed.location && parsed.location.latitude && parsed.location.longitude && (
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Location
              </label>
              <div className="mt-1">
                <p className="mb-1">
                  {formatGPSLocation(parsed.location.latitude, parsed.location.longitude)}
                </p>
                <a
                  href={getGoogleMapsUrl(parsed.location.latitude, parsed.location.longitude)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline text-xs"
                >
                  View on Google Maps
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

