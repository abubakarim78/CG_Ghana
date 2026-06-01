import { OfficerRole } from '@prisma/client';
import { prisma } from '../db';

export interface CreateOfficerInput {
  name: string;
  badge: string;
  district: string;
  region: string;
  role: OfficerRole;
  languages: string[];
  phone: string;
  userId?: string;
}

export const officersService = {
  async list(filters?: { district?: string; region?: string }) {
    return prisma.officer.findMany({
      where: {
        ...(filters?.district && { district: filters.district }),
        ...(filters?.region && { region: filters.region }),
      },
      orderBy: { caseload: 'asc' },
    });
  },

  async getById(id: string) {
    return prisma.officer.findUnique({
      where: { id },
      include: {
        assignedCases: {
          where: { status: { not: 'resolved' } },
          orderBy: { riskScore: 'desc' },
          take: 20,
        },
      },
    });
  },

  async create(data: CreateOfficerInput) {
    const existing = await prisma.officer.findUnique({ where: { badge: data.badge } });
    if (existing) throw Object.assign(new Error('Badge number already exists'), { status: 409 });

    return prisma.officer.create({ data });
  },

  async update(id: string, data: Partial<Omit<CreateOfficerInput, 'badge'>>) {
    return prisma.officer.update({ where: { id }, data });
  },

  async findNearest(lat: number, lng: number, region?: string) {
    const officers = await prisma.officer.findMany({
      where: {
        ...(region && { region }),
        caseload: { lt: 20 },
      },
      include: { user: { select: { id: true, expoPushToken: true } } },
    });

    if (!officers.length) return null;

    // Haversine-based nearest (computed in JS since PostGIS isn't required)
    function dist(aLat: number, aLng: number, bLat: number, bLng: number): number {
      const R = 6371;
      const dLat = ((bLat - aLat) * Math.PI) / 180;
      const dLng = ((bLng - aLng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    // Officers don't have coordinates, so sort by caseload as proxy when district/region matches
    return officers.sort((a, b) => a.caseload - b.caseload)[0];
  },
};
