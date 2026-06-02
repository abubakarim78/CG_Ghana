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

      // Still broadcast to all staff so someone can respond manually
      await pushService.sendToAllStaff(
        '🚨 SOS EMERGENCY — No Officer Available',
        `Emergency case #${newCase.caseNumber} in ${input.location.district}. No officer could be auto-assigned. Manual dispatch required.`,
        { caseId: newCase.id, caseNumber: newCase.caseNumber }
      );

      return { case: newCase, assignedOfficer: null };
    }

    const assigned = await casesService.assignOfficer(newCase.id, officer.id, 'SYSTEM (SOS)');

    // 1. Alert ALL officers so anyone nearby can respond if needed
    await pushService.sendToAllOfficers(
      '🚨 SOS EMERGENCY ALERT',
      `Emergency case #${newCase.caseNumber} in ${input.location.district}, ${input.location.region}. Assigned to ${officer.name}.`,
      { caseId: newCase.id, caseNumber: newCase.caseNumber, type: 'sos' }
    );

    // 2. Alert ALL admins
    await pushService.sendToAllAdmins(
      '🚨 SOS Dispatched',
      `Emergency case #${newCase.caseNumber} dispatched to ${officer.name} (${input.location.district}).`,
      { caseId: newCase.id, caseNumber: newCase.caseNumber, type: 'sos' }
    );

    return { case: assigned, assignedOfficer: officer };
  },
};
