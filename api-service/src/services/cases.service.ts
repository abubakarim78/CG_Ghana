import { CasePriority, CaseStatus, CaseType, Gender, Prisma } from '@prisma/client';
import { prisma } from '../db';
import { computeRiskScore } from '../utils/riskScoring';
import { generateCaseNumber } from '../utils/caseId';
import { pushService } from './push.service';

export interface SubmitReportInput {
  type: CaseType;
  childAge: number;
  childGender: Gender;
  location: { district: string; region: string; lat: number; lng: number; description?: string };
  description: string;
  photos: string[];
  isAnonymous: boolean;
  isEmergency: boolean;
  dangerTriage: { withPerp: boolean; recentViolence: boolean; noBasicNeeds: boolean };
  reporterId?: string;
}

export const casesService = {
  async submit(input: SubmitReportInput) {
    const { score, priority } = computeRiskScore(input.type, input.childAge, {
      ...input.dangerTriage,
      isEmergency: input.isEmergency,
    });

    const caseNumber = await generateCaseNumber();

    const newCase = await prisma.case.create({
      data: {
        caseNumber,
        type: input.type,
        childAge: input.childAge,
        childGender: input.childGender,
        district: input.location.district,
        region: input.location.region,
        lat: input.location.lat,
        lng: input.location.lng,
        locationDescription: input.location.description,
        description: input.description,
        photos: input.photos,
        isAnonymous: input.isAnonymous,
        isEmergency: input.isEmergency,
        status: 'submitted',
        priority,
        riskScore: score,
        reporterId: input.isAnonymous ? undefined : input.reporterId,
        timeline: {
          create: {
            status: 'submitted',
            title: 'Case Submitted',
            description: 'Report received and logged in the system.',
            isSystemEvent: true,
          },
        },
      },
      include: { timeline: true, assignedOfficer: true },
    });

    // Push notifications based on priority
    const notifData = { caseId: newCase.id, caseNumber: newCase.caseNumber };
    if (newCase.isEmergency) {
      // SOS cases are handled by emergency.service — skip here
    } else if (priority === 'critical' || priority === 'high') {
      await pushService.sendToAllStaff(
        priority === 'critical' ? '🔴 Critical Case Submitted' : '🟠 High Priority Case',
        `New ${priority} case #${caseNumber} — ${input.type.replace(/_/g, ' ')} in ${input.location.district}.`,
        notifData
      );
    } else {
      // Medium / low — notify admins only
      await pushService.sendToAllAdmins(
        '📋 New Case Submitted',
        `Case #${caseNumber} — ${input.type.replace(/_/g, ' ')} in ${input.location.district}.`,
        notifData
      );
    }

    return newCase;
  },

  async list(filters: {
    status?: CaseStatus;
    priority?: CasePriority;
    reporterId?: string;
    officerId?: string;
    region?: string;
  }) {
    const where: Prisma.CaseWhereInput = {};
    if (filters.status) where.status = filters.status;
    if (filters.priority) where.priority = filters.priority;
    if (filters.reporterId) where.reporterId = filters.reporterId;
    if (filters.officerId) where.assignedOfficerId = filters.officerId;
    if (filters.region) where.region = filters.region;

    return prisma.case.findMany({
      where,
      orderBy: [{ isEmergency: 'desc' }, { riskScore: 'desc' }, { reportedAt: 'desc' }],
      include: { timeline: { orderBy: { timestamp: 'asc' } }, assignedOfficer: true },
    });
  },

  async getById(id: string) {
    return prisma.case.findUnique({
      where: { id },
      include: { timeline: { orderBy: { timestamp: 'asc' } }, assignedOfficer: true, reporter: { select: { id: true, name: true, phone: true } } },
    });
  },

  async getByNumber(caseNumber: string) {
    return prisma.case.findUnique({
      where: { caseNumber },
      include: { timeline: { orderBy: { timestamp: 'asc' } }, assignedOfficer: true, reporter: { select: { id: true, name: true, phone: true } } },
    });
  },

  async updateStatus(
    caseId: string,
    status: CaseStatus,
    note: string,
    officerName: string,
    officerId?: string
  ) {
    const updated = await prisma.case.update({
      where: { id: caseId },
      data: {
        status,
        assignedOfficerId: officerId,
        timeline: {
          create: {
            status,
            title: `Status updated to ${status}`,
            description: note,
            officerName,
            isSystemEvent: false,
          },
        },
      },
      include: { timeline: { orderBy: { timestamp: 'asc' } }, assignedOfficer: true, reporter: true },
    });

    if (updated.reporterId) {
      await pushService.sendToUser(
        updated.reporterId,
        'Case Update',
        `Your case #${updated.caseNumber} status: ${status}`,
        { caseId }
      );
    }

    return updated;
  },

  async assignOfficer(caseId: string, officerId: string, adminName: string) {
    const officer = await prisma.officer.findUnique({ where: { id: officerId } });
    if (!officer) throw Object.assign(new Error('Officer not found'), { status: 404 });

    const updated = await prisma.$transaction(async (tx) => {
      await tx.officer.update({ where: { id: officerId }, data: { caseload: { increment: 1 } } });
      return tx.case.update({
        where: { id: caseId },
        data: {
          assignedOfficerId: officerId,
          status: 'assigned',
          timeline: {
            create: {
              status: 'assigned',
              title: 'Officer Assigned',
              description: `Assigned to ${officer.name} by ${adminName}`,
              officerName: officer.name,
              isSystemEvent: true,
            },
          },
        },
        include: { timeline: { orderBy: { timestamp: 'asc' } }, assignedOfficer: true },
      });
    });

    if (officer.userId) {
      await pushService.sendToUser(
        officer.userId,
        'New Case Assigned',
        `Case #${updated.caseNumber} has been assigned to you.`,
        { caseId }
      );
    }

    return updated;
  },
};
