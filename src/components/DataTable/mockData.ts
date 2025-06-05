import { DataItem } from './types';

// Generate mock data
export const generateMockData = (): DataItem[] => {
  const statuses = ['active', 'inactive', 'pending', 'resolved'] as const;
  const impacts = ['high', 'medium', 'low'] as const;
  const environments = ['production', 'staging', 'development'] as const;
  const severities = ['warning', 'major', 'critical'] as const;

  return Array.from({ length: 50 }, (_, i) => ({
    id: `id-${i + 1}`,
    objectId: `OBJ-${Math.floor(10000 + Math.random() * 90000)}`,
    description: `Issue description for item ${i + 1} - This is a longer description to test the column width and text wrapping behavior`,
    hierarchy: `Root / Level ${Math.floor(Math.random() * 3) + 1} / Sublevel ${Math.floor(Math.random() * 5) + 1}`,
    lastUpdated: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    startTime: new Date(Date.now() - Math.floor(Math.random() * 60) * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    impact: impacts[Math.floor(Math.random() * impacts.length)],
    environment: environments[Math.floor(Math.random() * environments.length)],
    origin: `System-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
    snId: `SN-${Math.floor(100000 + Math.random() * 900000)}`,
    identities: Array.from(
      { length: Math.floor(Math.random() * 3) + 1 },
      (_, j) => `Identity-${i}-${j}`
    ),
    severity: severities[Math.floor(Math.random() * severities.length)],
  }));
};


