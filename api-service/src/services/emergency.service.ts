import { prisma } from '../db';
import { casesService, SubmitReportInput } from './cases.service';
import { officersService } from './officers.service';
import { pushService } from './push.service';
import { logger } from '../utils/logger';

export const emergencyService = {
  async triggerSOS(input: SubmitReportInput & { reporterLat?: number; reporterLng?: number }) {
    const newCase = await casesService.submit({ ...input, isEmergency: true });

    const officer = await officersService.findNearest(
      input.location.lat,
      input.location.lng,
      input.location.region
    );

    if (!officer) {
      logger.warn('SOS: no available officer found', { caseId: newCase.id });
      return { case: newCase, assignedOfficer: null };
    }

    const assigned = await casesService.assignOfficer(newCase.id, officer.id, 'SYSTEM (SOS)');

    // Notify all admins
    const admins = await prisma.user.findMany({ where: { role: 'admin' } });
    await Promise.all(
      admins.map((admin) =>
        pushService.sendToUser(
          admin.id,
          'SOS Emergency',
          `Emergency case #${newCase.caseNumber} dispatched to ${officer.name}`,
          { caseId: newCase.id }
        )
      )
    );

    return { case: assigned, assignedOfficer: officer };
  },
};
