export interface Officer {
  id: string; name: string; badge: string; district: string; region: string;
  role: string; languages: string[]; caseload: number; resolvedThisMonth: number;
  phone: string; assignedCaseIds: string[];
}

export const MOCK_OFFICERS: Officer[] = [
  { id: 'OFF-001', name: 'Kwame Asante', badge: 'GPS-00421', district: 'Kumasi Metropolitan', region: 'Ashanti', role: 'social_worker', languages: ['en','tw'], caseload: 4, resolvedThisMonth: 6, phone: '+233 24 000 0001', assignedCaseIds: [] },
  { id: 'OFF-002', name: 'Akosua Mensah', badge: 'GPS-00389', district: 'Accra Metropolitan', region: 'Greater Accra', role: 'social_worker', languages: ['en','ga'], caseload: 3, resolvedThisMonth: 8, phone: '+233 24 000 0002', assignedCaseIds: [] },
  { id: 'OFF-003', name: 'Inspector Kofi Darko', badge: 'DOVVSU-112', district: 'Tema Metropolitan', region: 'Greater Accra', role: 'police_dovvsu', languages: ['en','ga'], caseload: 5, resolvedThisMonth: 4, phone: '+233 24 000 0003', assignedCaseIds: [] },
  { id: 'OFF-004', name: 'Sgt. Ama Owusu', badge: 'DOVVSU-089', district: 'Cape Coast', region: 'Central', role: 'police_dovvsu', languages: ['en','tw'], caseload: 2, resolvedThisMonth: 7, phone: '+233 24 000 0004', assignedCaseIds: [] },
  { id: 'OFF-005', name: 'Emmanuel Tetteh', badge: 'NGO-CRS-01', district: 'Ho', region: 'Volta', role: 'ngo_agent', languages: ['en'], caseload: 1, resolvedThisMonth: 5, phone: '+233 24 000 0005', assignedCaseIds: [] },
];
