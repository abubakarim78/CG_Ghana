export const MOCK_STATS = {
  totalCases: 147,
  openCases: 89,
  resolvedThisMonth: 23,
  criticalCases: 12,
  avgResponseHours: 18,
  monthlyTrend: [
    { month: 'Dec', count: 18 }, { month: 'Jan', count: 22 },
    { month: 'Feb', count: 19 }, { month: 'Mar', count: 25 },
    { month: 'Apr', count: 31 }, { month: 'May', count: 42 },
  ],
  casesByType: [
    { label: 'Child Labour', value: 62, color: '#F5A623' },
    { label: 'Trafficking', value: 31, color: '#E01B1B' },
    { label: 'Physical Abuse', value: 28, color: '#F97316' },
    { label: 'Early Marriage', value: 15, color: '#0E8FA8' },
    { label: 'Neglect', value: 11, color: '#9AAAB8' },
  ],
  casesByRegion: [
    { region: 'Greater Accra', count: 38, intensity: 0.95 },
    { region: 'Ashanti', count: 31, intensity: 0.82 },
    { region: 'Volta', count: 24, intensity: 0.63 },
    { region: 'Northern', count: 19, intensity: 0.50 },
    { region: 'Western', count: 14, intensity: 0.37 },
    { region: 'Central', count: 10, intensity: 0.26 },
    { region: 'Eastern', count: 8, intensity: 0.21 },
    { region: 'Brong Ahafo', count: 3, intensity: 0.08 },
  ],
};
