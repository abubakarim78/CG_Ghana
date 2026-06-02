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
    const PLACEHOLDER_REGIONS = ['Unassigned', 'Unknown', ''];
    const useRegionFilter = region && !PLACEHOLDER_REGIONS.includes(region);

    // Try region-specific officers first
    let officers = useRegionFilter
      ? await prisma.officer.findMany({
          where: { region, caseload: { lt: 20 } },
          include: { user: { select: { id: true, expoPushToken: true } } },
        })
      : [];

    // Fall back to any available officer platform-wide
    if (!officers.length) {
      officers = await prisma.officer.findMany({
        where: { caseload: { lt: 20 } },
        include: { user: { select: { id: true, expoPushToken: true } } },
      });
    }

    if (!officers.length) return null;

    // Return the officer with the lowest active caseload
    return officers.sort((a, b) => a.caseload - b.caseload)[0];
  },
};
