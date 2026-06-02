import * as Location from 'expo-location';
import { GHANA_DISTRICTS } from '../mock/geography';

export interface DetectedLocation {
  lat: number;
  lng: number;
  district: string;
  region: string;
  address: string;
  accuracy: number;
}

export async function detectCurrentLocation(): Promise<DetectedLocation | null> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    return null;
  }

  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
    timeInterval: 5000,
  });

  const { latitude, longitude, accuracy } = position.coords;

  let address = 'Ghana';
  try {
    const geocodeResults = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });
    if (geocodeResults && geocodeResults.length > 0) {
      const result = geocodeResults[0];
      const parts: string[] = [];
      if (result.street) parts.push(result.street);
      if (result.city) parts.push(result.city);
      address = parts.length > 0 ? parts.join(', ') : 'Ghana';
    }
  } catch {
    address = 'Ghana';
  }

  const { district, region } = findNearestDistrict(latitude, longitude);

  return {
    lat: latitude,
    lng: longitude,
    district,
    region,
    address,
    accuracy: accuracy ?? 0,
  };
}

export function findNearestDistrict(
  lat: number,
  lng: number
): { district: string; region: string } {
  let nearestDistrict = GHANA_DISTRICTS[0];
  let minDistance = haversineDistanceKm(lat, lng, nearestDistrict.lat, nearestDistrict.lng);

  for (let i = 1; i < GHANA_DISTRICTS.length; i++) {
    const d = GHANA_DISTRICTS[i];
    const distance = haversineDistanceKm(lat, lng, d.lat, d.lng);
    if (distance < minDistance) {
      minDistance = distance;
      nearestDistrict = d;
    }
  }

  return {
    district: nearestDistrict.name,
    region: nearestDistrict.region,
  };
}

export function haversineDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth radius in kilometers
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
