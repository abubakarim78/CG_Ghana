import React, { useRef, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import WebView, { WebViewMessageEvent } from 'react-native-webview';
import { COLORS, SPACING, RADIUS } from '../../theme';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface LocationMapPickerProps {
  /** Initial map center latitude — defaults to Ghana centre */
  initialLat?: number;
  /** Initial map center longitude — defaults to Ghana centre */
  initialLng?: number;
  /** Initial zoom level.  7 = country view, 14 = street-level */
  initialZoom?: number;
  /** Latitude of an existing pin to render on mount */
  markerLat?: number;
  /** Longitude of an existing pin to render on mount */
  markerLng?: number;
  /** Called whenever the user taps the map (interactive mode only) */
  onLocationSelect?: (lat: number, lng: number) => void;
  /** Container height in dp — defaults to 220 */
  height?: number;
  /** When false the map is read-only (no tap-to-place). Defaults to true */
  interactive?: boolean;
  /** Hex colour string for the marker pin.  Defaults to emergency red */
  markerColor?: string;
}

// ---------------------------------------------------------------------------
// HTML builder
// ---------------------------------------------------------------------------

function mapHtml(
  initialLat: number,
  initialLng: number,
  zoom: number,
  markerLat?: number,
  markerLng?: number,
  interactive: boolean = true,
  color: string = '#E01B1B',
): string {
  const hasInitialMarker =
    markerLat !== undefined && markerLng !== undefined;

  const initialMarkerScript = hasInitialMarker
    ? `
      marker = L.marker([${markerLat}, ${markerLng}], { icon: buildIcon() }).addTo(map);
    `
    : '';

  const clickHandlerScript = interactive
    ? `
      map.on('click', function(e) {
        var lat = e.latlng.lat;
        var lng = e.latlng.lng;
        if (marker) {
          marker.setLatLng([lat, lng]);
        } else {
          marker = L.marker([lat, lng], { icon: buildIcon() }).addTo(map);
        }
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(
            JSON.stringify({ type: 'tap', lat: lat, lng: lng })
          );
        }
      });
    `
    : '';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link
    rel="stylesheet"
    href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    crossorigin=""
  />
  <script
    src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
    crossorigin=""
  ></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; background: #0D1620; }
    #map { width: 100%; height: 100%; background: #0D1620; }

    /* Desaturate tiles for dark-theme look */
    .leaflet-tile-pane {
      filter: brightness(0.75) contrast(1.1) saturate(0.8);
    }

    /* Attribution — keep tiny */
    .leaflet-control-attribution {
      font-size: 8px !important;
      opacity: 0.5 !important;
      background: rgba(0,0,0,0.4) !important;
      color: #aaa !important;
    }
    .leaflet-control-attribution a { color: #aaa !important; }

    /* Custom marker */
    .cg-marker-outer {
      width: 28px;
      height: 28px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid rgba(255,255,255,0.85);
      box-shadow: 0 2px 8px rgba(0,0,0,0.55);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .cg-marker-inner {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: rgba(255,255,255,0.9);
      transform: rotate(45deg);
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    (function() {
      var MARKER_COLOR = '${color}';

      function buildIcon() {
        return L.divIcon({
          className: '',
          html: '<div class="cg-marker-outer" style="background:' + MARKER_COLOR + ';">' +
                  '<div class="cg-marker-inner"></div>' +
                '</div>',
          iconSize: [28, 28],
          iconAnchor: [14, 28],
          popupAnchor: [0, -28],
        });
      }

      var map = L.map('map', {
        center: [${initialLat}, ${initialLng}],
        zoom: ${zoom},
        zoomControl: false,
        attributionControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      var marker = null;

      ${initialMarkerScript}

      ${clickHandlerScript}
    })();
  </script>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Haversine helper
// ---------------------------------------------------------------------------

/**
 * Returns the great-circle distance in kilometres between two coordinates.
 * Uses the Haversine formula.
 */
export function getDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371; // Earth radius in km
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function LocationMapPicker({
  initialLat = 7.9465,
  initialLng = -1.0232,
  initialZoom = 7,
  markerLat,
  markerLng,
  onLocationSelect,
  height = 220,
  interactive = true,
  markerColor = '#E01B1B',
}: LocationMapPickerProps) {
  const webViewRef = useRef<WebView>(null);

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);
        if (data.type === 'tap' && onLocationSelect) {
          onLocationSelect(data.lat, data.lng);
        }
      } catch {
        // Ignore malformed messages
      }
    },
    [onLocationSelect],
  );

  const html = mapHtml(
    initialLat,
    initialLng,
    initialZoom,
    markerLat,
    markerLng,
    interactive,
    markerColor,
  );

  return (
    <View style={[styles.container, { height }]}>
      <WebView
        ref={webViewRef}
        source={{ html }}
        onMessage={handleMessage}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        style={styles.webView}
        originWhitelist={['*']}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loader}>
            <ActivityIndicator size="small" color={COLORS.primary[500]} />
            <Text style={styles.loaderText}>Loading map…</Text>
          </View>
        )}
      />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    backgroundColor: COLORS.surface.dark,
  },
  webView: {
    flex: 1,
    backgroundColor: COLORS.surface.dark,
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.surface.dark,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  loaderText: {
    color: COLORS.text.muted,
    fontSize: 13,
  },
});

export default LocationMapPicker;
