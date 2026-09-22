import { Friend, AppNotificationLog } from '../types';
import { getDaysUntilBirthday, formatBirthdayTurkish } from './birthdayUtils';
import { playChimeSound } from './audio';
import { loadNotificationsFromStorage, saveNotificationsToStorage } from './storage';

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied';
  }
  try {
    return await Notification.requestPermission();
  } catch (err) {
    console.error('Error requesting notification permission:', err);
    return 'default';
  }
}

export function getNotificationPermissionStatus(): NotificationPermission {
  if (!('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}

export function dispatchLocalNotification(
  title: string,
  body: string,
  friendId: string,
  friendName: string,
  triggerType: AppNotificationLog['triggerType']
): AppNotificationLog {
  // 1. Play audio chime
  playChimeSound(triggerType === 'on_day' ? 'celebrate' : 'notification');

  // 2. Trigger native OS / browser notification if permitted
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=128&auto=format&fit=crop&q=60',
        badge: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=64&auto=format&fit=crop&q=60',
        tag: `bday-${friendId}-${triggerType}-${Date.now()}`
      });
    } catch {
      // Notification failed in iframe or mobile browser fallback
    }
  }

  // 3. Save to in-app notification center log
  const newLog: AppNotificationLog = {
    id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    friendId,
    friendName,
    title,
    body,
    triggerType,
    timestamp: new Date().toISOString(),
    isRead: false
  };

  const existingLogs = loadNotificationsFromStorage();
  const updatedLogs = [newLog, ...existingLogs];
  saveNotificationsToStorage(updatedLogs);

  return newLog;
}

/**
 * Checks all friends against current date and sends due reminders if not already sent today.
 */
export function checkUpcomingBirthdaysForNotifications(friends: Friend[]): AppNotificationLog[] {
  const sentTodayKey = `bday_sent_date_${new Date().toISOString().split('T')[0]}`;
  const alreadySentRaw = localStorage.getItem(sentTodayKey);
  const sentTags: string[] = alreadySentRaw ? JSON.parse(alreadySentRaw) : [];
  const newlyTriggered: AppNotificationLog[] = [];

  friends.forEach(friend => {
    if (!friend.notifications || !friend.notifications.enabled) return;

    const days = getDaysUntilBirthday(friend.birthDate);
    const dateFormatted = formatBirthdayTurkish(friend.birthDate, false);

    // 1. Tam gününde
    if (days === 0 && friend.notifications.onDay) {
      const tag = `${friend.id}-on_day`;
      if (!sentTags.includes(tag)) {
        const log = dispatchLocalNotification(
          `🎉 Bugün ${friend.name} Doğum Günü!`,
          `Bugün ${friend.name} için kutlama vakti! Bir hediye fikri seç veya hemen ara!`,
          friend.id,
          friend.name,
          'on_day'
        );
        sentTags.push(tag);
        newlyTriggered.push(log);
      }
    }

    // 2. 1 gün önce
    if (days === 1 && friend.notifications.oneDayBefore) {
      const tag = `${friend.id}-1_day_before`;
      if (!sentTags.includes(tag)) {
        const log = dispatchLocalNotification(
          `🎈 Yarın ${friend.name} Doğum Günü!`,
          `${friend.name} yarın yeni yaşına giriyor (${dateFormatted}). Hediyen hazır mı?`,
          friend.id,
          friend.name,
          '1_day_before'
        );
        sentTags.push(tag);
        newlyTriggered.push(log);
      }
    }

    // 3. 3 gün önce
    if (days === 3 && friend.notifications.threeDaysBefore) {
      const tag = `${friend.id}-3_days_before`;
      if (!sentTags.includes(tag)) {
        const log = dispatchLocalNotification(
          `🎁 3 Gün Kaldı: ${friend.name}`,
          `${friend.name} doğum gününe 3 gün kaldı (${dateFormatted}). Hediye siparişi için tam zamanı!`,
          friend.id,
          friend.name,
          '3_days_before'
        );
        sentTags.push(tag);
        newlyTriggered.push(log);
      }
    }

    // 4. 1 hafta önce
    if (days === 7 && friend.notifications.oneWeekBefore) {
      const tag = `${friend.id}-1_week_before`;
      if (!sentTags.includes(tag)) {
        const log = dispatchLocalNotification(
          `📅 1 Hafta Kaldı: ${friend.name}`,
          `${friend.name} doğum gününe tam 1 hafta kaldı (${dateFormatted}). Fikirlerini gözden geçir.`,
          friend.id,
          friend.name,
          '1_week_before'
        );
        sentTags.push(tag);
        newlyTriggered.push(log);
      }
    }
  });

  try {
    localStorage.setItem(sentTodayKey, JSON.stringify(sentTags));
  } catch {
    // Ignore storage quota
  }

  return newlyTriggered;
}

export function sendTestNotification(friend: Friend, triggerType: AppNotificationLog['triggerType'] = 'test'): AppNotificationLog {
  const days = getDaysUntilBirthday(friend.birthDate);
  let title = `🔔 Hatırlatıcı Testi: ${friend.name}`;
  let body = `${friend.name} için bildirimler aktif! (Doğum gününe ${days} gün var - ${formatBirthdayTurkish(friend.birthDate, false)})`;

  if (triggerType === 'on_day') {
    title = `🎉 [Test] Bugün ${friend.name} Doğum Günü!`;
    body = `Özel gün bildirimi: Tam gününde saat ${friend.notifications?.time || '09:00'} hatırlatıcısı başarıyla çalıştı.`;
  } else if (triggerType === '1_day_before') {
    title = `🎈 [Test] Yarın ${friend.name} Doğum Günü!`;
    body = `1 gün önce hatırlatıcısı başarıyla test edildi.`;
  } else if (triggerType === '3_days_before') {
    title = `🎁 [Test] 3 Gün Kaldı: ${friend.name}`;
    body = `3 gün önce hatırlatıcısı başarıyla test edildi.`;
  } else if (triggerType === '1_week_before') {
    title = `📅 [Test] 1 Hafta Kaldı: ${friend.name}`;
    body = `1 hafta önce hatırlatıcısı başarıyla test edildi.`;
  }

  return dispatchLocalNotification(title, body, friend.id, friend.name, triggerType);
}
