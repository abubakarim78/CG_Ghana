import Expo, { ExpoPushMessage } from 'expo-server-sdk';
import { prisma } from '../db';
import { logger } from '../utils/logger';

const expo = new Expo();

export const pushService = {
  async sendToUser(userId: string, title: string, body: string, data?: Record<string, unknown>) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { expoPushToken: true } });
    if (!user?.expoPushToken || !Expo.isExpoPushToken(user.expoPushToken)) return;

    await pushService.sendRaw([{ to: user.expoPushToken, title, body, data }]);
  },

  async sendToOfficers(officerIds: string[], title: string, body: string, data?: Record<string, unknown>) {
    const officers = await prisma.officer.findMany({
      where: { id: { in: officerIds } },
      include: { user: { select: { expoPushToken: true } } },
    });

    const messages: ExpoPushMessage[] = officers
      .filter((o) => o.user?.expoPushToken && Expo.isExpoPushToken(o.user.expoPushToken))
      .map((o) => ({ to: o.user!.expoPushToken!, title, body, data }));

    if (messages.length) await pushService.sendRaw(messages);
  },

  async sendRaw(messages: ExpoPushMessage[]) {
    const chunks = expo.chunkPushNotifications(messages);
    for (const chunk of chunks) {
      try {
        const receipts = await expo.sendPushNotificationsAsync(chunk);
        receipts.forEach((r) => {
          if (r.status === 'error') logger.warn('Push error', { r });
        });
      } catch (err) {
        logger.error('Push send failed', { err });
      }
    }
  },
};
