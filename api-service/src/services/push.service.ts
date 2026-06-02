import Expo, { ExpoPushMessage } from 'expo-server-sdk';
import { prisma } from '../db';
import { logger } from '../utils/logger';

const expo = new Expo();

export const pushService = {
  // Send to a single user by their user id
  async sendToUser(
    userId: string,
    title: string,
    body: string,
    data?: Record<string, unknown>
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { expoPushToken: true },
    });
    if (!user?.expoPushToken || !Expo.isExpoPushToken(user.expoPushToken)) return;
    await pushService.sendRaw([{ to: user.expoPushToken, title, body, data }]);
  },

  // Send to a specific list of officers by officer id
  async sendToOfficers(
    officerIds: string[],
    title: string,
    body: string,
    data?: Record<string, unknown>
  ) {
    const officers = await prisma.officer.findMany({
      where: { id: { in: officerIds } },
      include: { user: { select: { expoPushToken: true } } },
    });

    const messages: ExpoPushMessage[] = officers
      .filter((o) => o.user?.expoPushToken && Expo.isExpoPushToken(o.user.expoPushToken))
      .map((o) => ({ to: o.user!.expoPushToken!, title, body, data }));

    if (messages.length) await pushService.sendRaw(messages);
  },

  // Broadcast to every registered officer on the platform
  async sendToAllOfficers(
    title: string,
    body: string,
    data?: Record<string, unknown>
  ) {
    const officers = await prisma.officer.findMany({
      include: { user: { select: { expoPushToken: true } } },
    });

    const messages: ExpoPushMessage[] = officers
      .filter((o) => o.user?.expoPushToken && Expo.isExpoPushToken(o.user.expoPushToken))
      .map((o) => ({ to: o.user!.expoPushToken!, title, body, data }));

    if (messages.length) await pushService.sendRaw(messages);
  },

  // Broadcast to every admin user
  async sendToAllAdmins(
    title: string,
    body: string,
    data?: Record<string, unknown>
  ) {
    const admins = await prisma.user.findMany({
      where: { role: 'admin', expoPushToken: { not: null } },
      select: { expoPushToken: true },
    });

    const messages: ExpoPushMessage[] = admins
      .filter((a) => a.expoPushToken && Expo.isExpoPushToken(a.expoPushToken))
      .map((a) => ({ to: a.expoPushToken!, title, body, data }));

    if (messages.length) await pushService.sendRaw(messages);
  },

  // Broadcast to all officers AND all admins at once
  async sendToAllStaff(
    title: string,
    body: string,
    data?: Record<string, unknown>
  ) {
    await Promise.all([
      pushService.sendToAllOfficers(title, body, data),
      pushService.sendToAllAdmins(title, body, data),
    ]);
  },

  async sendRaw(messages: ExpoPushMessage[]) {
    const chunks = expo.chunkPushNotifications(messages);
    for (const chunk of chunks) {
      try {
        const receipts = await expo.sendPushNotificationsAsync(chunk);
        receipts.forEach((r) => {
          if (r.status === 'error') logger.warn('Push delivery error', { r });
        });
      } catch (err) {
        logger.error('Push send failed', { err });
      }
    }
  },
};
