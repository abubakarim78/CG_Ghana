export interface HeatmapPoint {
  district: string; region: string; lat: number; lng: number; caseCount: number; intensity: number;
}

export const HEATMAP_DATA: HeatmapPoint[] = [
  { district: 'Accra Metropolitan', region: 'Greater Accra', lat: 5.6037, lng: -0.1870, caseCount: 47, intensity: 0.95 },
  { district: 'Kumasi Metropolitan', region: 'Ashanti', lat: 6.6885, lng: -1.6244, caseCount: 41, intensity: 0.88 },
  { district: 'Tamale Metropolitan', region: 'Northern', lat: 9.4075, lng: -0.8533, caseCount: 28, intensity: 0.61 },
  { district: 'Tarkwa-Nsuaem', region: 'Western', lat: 5.30, lng: -1.99, caseCount: 22, intensity: 0.48 },
  { district: 'Bawku', region: 'Upper East', lat: 11.06, lng: -0.24, caseCount: 19, intensity: 0.42 },
  { district: 'Techiman', region: 'Bono East', lat: 7.59, lng: -1.93, caseCount: 14, intensity: 0.31 },
  { district: 'Keta', region: 'Volta', lat: 5.92, lng: 0.99, caseCount: 12, intensity: 0.27 },
  { district: 'Sekondi-Takoradi', region: 'Western', lat: 4.93, lng: -1.75, caseCount: 9, intensity: 0.20 },
  { district: 'Ho', region: 'Volta', lat: 6.60, lng: 0.47, caseCount: 7, intensity: 0.15 },
  { district: 'Wa', region: 'Upper West', lat: 10.05, lng: -2.50, caseCount: 5, intensity: 0.11 },
];
