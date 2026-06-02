export interface GhanaRegion {
  name: string;
  capital: string;
  lat: number;
  lng: number;
}

export interface GhanaDistrict {
  name: string;
  region: string;
  lat: number;
  lng: number;
}

export const GHANA_REGIONS: GhanaRegion[] = [
  { name: 'Greater Accra', capital: 'Accra', lat: 5.6037, lng: -0.1870 },
  { name: 'Ashanti', capital: 'Kumasi', lat: 6.6885, lng: -1.6244 },
  { name: 'Northern', capital: 'Tamale', lat: 9.4075, lng: -0.8533 },
  { name: 'Western', capital: 'Sekondi-Takoradi', lat: 4.9344, lng: -1.7713 },
  { name: 'Central', capital: 'Cape Coast', lat: 5.1053, lng: -1.2466 },
  { name: 'Volta', capital: 'Ho', lat: 6.6005, lng: 0.4706 },
  { name: 'Eastern', capital: 'Koforidua', lat: 6.0940, lng: -0.2590 },
  { name: 'Brong-Ahafo', capital: 'Sunyani', lat: 7.3349, lng: -2.3265 },
  { name: 'Upper East', capital: 'Bolgatanga', lat: 10.7878, lng: -0.8514 },
  { name: 'Upper West', capital: 'Wa', lat: 10.0601, lng: -2.5099 },
  { name: 'Oti', capital: 'Dambai', lat: 8.0690, lng: 0.1769 },
  { name: 'Bono East', capital: 'Techiman', lat: 7.5867, lng: -1.9359 },
  { name: 'Ahafo', capital: 'Goaso', lat: 6.8000, lng: -2.5200 },
  { name: 'Western North', capital: 'Sefwi Wiawso', lat: 6.2098, lng: -2.4870 },
  { name: 'North East', capital: 'Nalerigu', lat: 10.5230, lng: -0.3640 },
  { name: 'Savannah', capital: 'Damongo', lat: 9.0831, lng: -1.8231 },
];

export const GHANA_DISTRICTS: GhanaDistrict[] = [
  // Greater Accra
  { name: 'Accra Metropolitan', region: 'Greater Accra', lat: 5.6037, lng: -0.1870 },
  { name: 'Tema Metropolitan', region: 'Greater Accra', lat: 5.6698, lng: -0.0166 },
  { name: 'Ashaiman', region: 'Greater Accra', lat: 5.6958, lng: -0.0283 },
  { name: 'La Dade-Kotopon', region: 'Greater Accra', lat: 5.5817, lng: -0.1494 },
  { name: 'Ga East', region: 'Greater Accra', lat: 5.6800, lng: -0.2200 },

  // Ashanti
  { name: 'Kumasi Metropolitan', region: 'Ashanti', lat: 6.6885, lng: -1.6244 },
  { name: 'Obuasi', region: 'Ashanti', lat: 6.2044, lng: -1.6647 },
  { name: 'Asante Akim Central', region: 'Ashanti', lat: 6.7000, lng: -1.1500 },
  { name: 'Ejisu-Juaben', region: 'Ashanti', lat: 6.7500, lng: -1.4700 },

  // Northern
  { name: 'Tamale Metropolitan', region: 'Northern', lat: 9.4075, lng: -0.8533 },
  { name: 'Yendi', region: 'Northern', lat: 9.4424, lng: -0.0082 },
  { name: 'Nanumba North', region: 'Northern', lat: 8.9600, lng: -0.2800 },

  // Western
  { name: 'Sekondi-Takoradi', region: 'Western', lat: 4.9344, lng: -1.7713 },
  { name: 'Tarkwa-Nsuaem', region: 'Western', lat: 5.3016, lng: -1.9947 },
  { name: 'Prestea-Huni Valley', region: 'Western', lat: 5.4333, lng: -2.1500 },

  // Central
  { name: 'Cape Coast', region: 'Central', lat: 5.1053, lng: -1.2466 },
  { name: 'Mfantsiman', region: 'Central', lat: 5.1167, lng: -1.0167 },
  { name: 'Assin Central', region: 'Central', lat: 5.7500, lng: -1.3500 },

  // Volta
  { name: 'Ho', region: 'Volta', lat: 6.6005, lng: 0.4706 },
  { name: 'Keta', region: 'Volta', lat: 5.9135, lng: 0.9915 },
  { name: 'Hohoe', region: 'Volta', lat: 7.1517, lng: 0.4755 },
  { name: 'Kpando', region: 'Volta', lat: 7.0005, lng: 0.2974 },
  { name: 'Nkwanta', region: 'Oti', lat: 8.0000, lng: 0.5100 },

  // Eastern
  { name: 'Koforidua', region: 'Eastern', lat: 6.0940, lng: -0.2590 },
  { name: 'Akuapem North', region: 'Eastern', lat: 5.9200, lng: -0.0800 },

  // Brong-Ahafo / Bono East / Ahafo
  { name: 'Sunyani', region: 'Brong-Ahafo', lat: 7.3349, lng: -2.3265 },
  { name: 'Techiman', region: 'Bono East', lat: 7.5867, lng: -1.9359 },
  { name: 'Dormaa', region: 'Brong-Ahafo', lat: 7.2961, lng: -2.8433 },
  { name: 'Salaga', region: 'Savannah', lat: 8.5525, lng: -0.5168 },

  // Upper East
  { name: 'Bolgatanga', region: 'Upper East', lat: 10.7878, lng: -0.8514 },
  { name: 'Bawku', region: 'Upper East', lat: 11.0600, lng: -0.2400 },
  { name: 'Navrongo', region: 'Upper East', lat: 10.8951, lng: -1.0927 },

  // Upper West
  { name: 'Wa', region: 'Upper West', lat: 10.0601, lng: -2.5099 },
  { name: 'Lawra', region: 'Upper West', lat: 10.6525, lng: -2.8862 },

  // Western North
  { name: 'Sefwi Wiawso', region: 'Western North', lat: 6.2098, lng: -2.4870 },
];
