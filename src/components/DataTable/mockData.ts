import { DataItem } from './types';

// Generate mock data with Hebrew descriptions
export const generateMockData = (): DataItem[] => {
  const statuses = ['active', 'inactive', 'pending', 'resolved'] as const;
  const impacts = ['high', 'medium', 'low'] as const;
  const environments = ['production', 'staging', 'development'] as const;
  const severities = ['warning', 'major', 'critical', 'disabled'] as const;

  // Hebrew descriptions for testing sorting
  const hebrewDescriptions = [
    'אבחון מערכת נתונים',
    'בעיה בחיבור למסד הנתונים',
    'גיבוי קבצים שנכשל',
    'דוח שגיאות במערכת',
    'האצה של תהליכי עיבוד',
    'ועדת אבטחת מידע',
    'זיהוי פרצות אבטחה',
    'חידוש תעודות SSL',
    'טעינה איטית של דפים',
    'יצירת גיבוי אוטומטי',
    'כשל בשרת הראשי',
    'לוג שגיאות מערכת',
    'מחיקת קבצים זמניים',
    'נטור ביצועי מערכת',
    'סינכרון נתונים בין שרתים',
    'עדכון תוכנת אנטי וירוס',
    'פגיעה ברשת התקשורת',
    'צפיפות תעבורה גבוהה',
    'קונפיגורציה של פיירוול',
    'רכישת רישיונות תוכנה',
    'שדרוג חומרת שרתים',
    'תחזוקה מתוכננת של מערכת'
  ];

  // English descriptions for testing sorting
  const englishDescriptions = [
    'Application server timeout',
    'Background job processing error',
    'Cache invalidation failed',
    'Database connection pool exhausted',
    'Email notification service down',
    'File system disk space low',
    'Gateway service unavailable',
    'HTTP response time exceeded',
    'Integration service failure',
    'JSON parsing error in API',
    'Kubernetes pod restart loop',
    'Load balancer health check failed',
    'Memory usage threshold exceeded',
    'Network latency spike detected',
    'OAuth authentication failure',
    'Payment gateway connection error',
    'Queue processing backlog',
    'Redis cache connection timeout',
    'SSL certificate expiration warning',
    'Third-party API rate limit exceeded',
    'User session timeout',
    'VPN connection instability',
    'WebSocket connection dropped',
    'XML validation error'
  ];

  // Hebrew object IDs for testing
  const hebrewObjectIds = [
    'אב-001', 'בג-002', 'גד-003', 'דה-004', 'הו-005',
    'וז-006', 'זח-007', 'חט-008', 'טי-009', 'יכ-010'
  ];

  // Mixed hierarchy paths (Hebrew and English)
  const hierarchyPaths = [
    'ארגון / מחלקת IT / שרתים',
    'ארגון / מחלקת IT / רשת',
    'בינוי / תשתיות / מסדי נתונים',
    'גיבוי / מערכות / אחסון',
    'דיווחים / ניתוח / ביצועים',
    'הפקה / אפליקציות / ווב',
    'Root / Infrastructure / Servers',
    'Root / Applications / Frontend',
    'Root / Security / Authentication',
    'Root / Network / Monitoring',
    'Organization / Development / Testing',
    'Organization / Operations / Maintenance'
  ];

  return Array.from({ length: 50 }, (_, i) => {
    // Mix Hebrew and English descriptions (about 60% Hebrew, 40% English)
    const useHebrew = Math.random() < 0.6;
    const descriptions = useHebrew ? hebrewDescriptions : englishDescriptions;
    const description = descriptions[Math.floor(Math.random() * descriptions.length)];

    // Mix Hebrew and English object IDs
    const useHebrewObjectId = Math.random() < 0.4;
    const objectId = useHebrewObjectId 
      ? hebrewObjectIds[Math.floor(Math.random() * hebrewObjectIds.length)]
      : `OBJ-${Math.floor(10000 + Math.random() * 90000)}`;

    return {
      id: `id-${i + 1}`,
      objectId: objectId,
      description: description,
      hierarchy: hierarchyPaths[Math.floor(Math.random() * hierarchyPaths.length)],
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
    };
  });
};