import { prisma } from '../db';

export const statsService = {
  async dashboard() {
    const [totalCases, openCases, criticalCases, resolvedThisMonth, allCases] = await Promise.all([
      prisma.case.count(),
      prisma.case.count({ where: { status: { not: 'resolved' } } }),
      prisma.case.count({ where: { priority: 'critical', status: { not: 'resolved' } } }),
      prisma.case.count({
        where: {
          status: 'resolved',
          updatedAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
        },
      }),
      prisma.case.findMany({
        select: { type: true, region: true, district: true, lat: true, lng: true, reportedAt: true },
      }),
    ]);

    // Monthly trend — last 6 months
    const now = new Date();
    const monthlyTrend = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const next = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const count = allCases.filter((c) => c.reportedAt >= d && c.reportedAt < next).length;
      return { month: d.toISOString().slice(0, 7), count };
    }).reverse();

    // Cases by type
    const typeCounts: Record<string, number> = {};
    allCases.forEach((c) => { typeCounts[c.type] = (typeCounts[c.type] ?? 0) + 1; });
    const casesByType = Object.entries(typeCounts).map(([label, value]) => ({ label, value }));

    // Cases by region
    const regionCounts: Record<string, number> = {};
    allCases.forEach((c) => { regionCounts[c.region] = (regionCounts[c.region] ?? 0) + 1; });
    const maxCount = Math.max(1, ...Object.values(regionCounts));
    const casesByRegion = Object.entries(regionCounts).map(([region, count]) => ({
      region,
      count,
      intensity: count / maxCount,
    }));

    return {
      totalCases,
      openCases,
      resolvedThisMonth,
      criticalCases,
      avgResponseHours: 0, // placeholder — needs SLA tracking field
      monthlyTrend,
      casesByType,
      casesByRegion,
    };
  },

  async heatmap() {
    const cases = await prisma.case.findMany({
      select: { district: true, region: true, lat: true, lng: true },
    });

    const buckets: Record<string, { district: string; region: string; lat: number; lng: number; count: number }> = {};
    cases.forEach((c) => {
      const key = c.district;
      if (!buckets[key]) buckets[key] = { district: c.district, region: c.region, lat: c.lat, lng: c.lng, count: 0 };
      buckets[key].count++;
    });

    const points = Object.values(buckets);
    const maxCount = Math.max(1, ...points.map((p) => p.count));
    return points.map((p) => ({ ...p, intensity: p.count / maxCount }));
  },
};
