import * as Notifications from 'expo-notifications';
import { useNotificationStore } from '../store/notificationStore';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function scheduleCaseProgressNotifications(caseId: string): void {
  const { addNotification } = useNotificationStore.getState();

  setTimeout(() => {
    addNotification({
      caseId,
      title: 'Case Received',
      body: `Your report ${caseId} has been received and is being reviewed.`,
    });
  }, 10000);

  setTimeout(() => {
    addNotification({
      caseId,
      title: 'Officer Assigned',
      body: `A welfare officer has been assigned to case ${caseId}.`,
    });
  }, 30000);

  setTimeout(() => {
    addNotification({
      caseId,
      title: 'Investigation Started',
      body: `The investigation for case ${caseId} is now underway.`,
    });
  }, 60000);
}
