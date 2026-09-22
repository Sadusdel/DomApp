import { Friend, AppNotificationLog } from '../types';

const STORAGE_KEY_FRIENDS = 'bday_friends_v1';
const STORAGE_KEY_NOTIFICATIONS = 'bday_notification_logs_v1';

// Initial sample friends with diverse upcoming dates relative to current date (e.g. Sept 2026)
export const DEFAULT_FRIENDS: Friend[] = [
  {
    id: 'friend-1',
    name: 'Can Özkan',
    birthDate: '1998-09-22', // Today!
    includeYear: true,
    avatarColor: '#F97316', // Orange
    phone: '+90 555 123 4567',
    notes: 'Çok yakın lise arkadaşım. Kahve ve bisiklet tutkunu.',
    notifications: {
      enabled: true,
      onDay: true,
      oneDayBefore: true,
      threeDaysBefore: false,
      oneWeekBefore: true,
      time: '09:00'
    },
    giftIdeas: [
      {
        id: 'gift-101',
        title: 'V60 Seramik Kahve Demleme Seti',
        estimatedPrice: 650,
        currency: '₺',
        notes: 'Hario V60 kırmızı renk istiyordu.',
        priority: 'high',
        isPurchased: true,
        createdAt: '2026-08-15T10:00:00.000Z'
      },
      {
        id: 'gift-102',
        title: 'Özel Seri Bisiklet Eldiveni',
        estimatedPrice: 420,
        currency: '₺',
        notes: 'Siyah-gri L beden',
        priority: 'medium',
        isPurchased: false,
        createdAt: '2026-09-01T14:30:00.000Z'
      }
    ],
    givenGifts: [
      {
        id: 'given-101',
        year: 2025,
        title: 'Columbia Termos Kupa',
        price: 550,
        notes: 'Kamp yapmayı sevdiği için çok beğendi.',
        createdAt: '2025-09-23T11:00:00.000Z'
      },
      {
        id: 'given-102',
        year: 2024,
        title: 'Mavi Keten Gömlek',
        price: 350,
        notes: 'Doğum günü partisinde giydi.',
        createdAt: '2024-09-24T12:00:00.000Z'
      }
    ],
    receivedGifts: [
      {
        id: 'rec-101',
        year: 2025,
        title: 'JBL Taşınabilir Hoparlör',
        notes: 'Benim doğum günümde sürpriz yapmıştı, harika bir ses kalitesi var.',
        createdAt: '2025-05-15T09:00:00.000Z'
      },
      {
        id: 'rec-102',
        year: 2024,
        title: 'Minimalist Masa Lambası',
        notes: 'Çalışma masam için almıştı.',
        createdAt: '2024-05-15T09:00:00.000Z'
      }
    ],
    createdAt: '2026-01-10T10:00:00.000Z',
    updatedAt: '2026-09-22T08:00:00.000Z'
  },
  {
    id: 'friend-2',
    name: 'Elif Yılmaz',
    birthDate: '1997-09-25', // 3 days away
    includeYear: true,
    avatarColor: '#EC4899', // Pink
    phone: '+90 532 987 6543',
    notes: 'Üniversiteden ev arkadaşım. Kitap ve seramik kurslarına meraklı.',
    notifications: {
      enabled: true,
      onDay: true,
      oneDayBefore: true,
      threeDaysBefore: true,
      oneWeekBefore: true,
      time: '09:00'
    },
    giftIdeas: [
      {
        id: 'gift-201',
        title: 'Kindle Paperwhite Kılıfı & Işığı',
        estimatedPrice: 750,
        currency: '₺',
        notes: 'Haki yeşili rengi seviyor.',
        priority: 'high',
        isPurchased: false,
        createdAt: '2026-09-10T12:00:00.000Z'
      },
      {
        id: 'gift-202',
        title: 'Deri Ciltli Sanatçı Defteri',
        estimatedPrice: 380,
        currency: '₺',
        notes: 'Eskiz ve suluboya için uygun kağıt.',
        priority: 'medium',
        isPurchased: false,
        createdAt: '2026-09-12T16:00:00.000Z'
      }
    ],
    givenGifts: [
      {
        id: 'given-201',
        year: 2025,
        title: 'Yün Bere & Kaşkol Takımı',
        price: 450,
        notes: 'Kış tatili öncesinde hediye ettim.',
        createdAt: '2025-09-26T10:00:00.000Z'
      }
    ],
    receivedGifts: [
      {
        id: 'rec-201',
        year: 2025,
        title: 'Gümüş Tasarım Kol Düğmesi',
        notes: 'Şık bir kutu içinde notla birlikte vermişti.',
        createdAt: '2025-05-15T12:00:00.000Z'
      }
    ],
    createdAt: '2026-01-15T10:00:00.000Z',
    updatedAt: '2026-09-20T10:00:00.000Z'
  },
  {
    id: 'friend-3',
    name: 'Mert Demir',
    birthDate: '1995-10-02', // 10 days away
    includeYear: true,
    avatarColor: '#3B82F6', // Blue
    phone: '+90 544 333 2211',
    notes: 'Yazılımcı arkadaşım, oyun ve gadget sever.',
    notifications: {
      enabled: true,
      onDay: true,
      oneDayBefore: true,
      threeDaysBefore: true,
      oneWeekBefore: false,
      time: '09:00'
    },
    giftIdeas: [
      {
        id: 'gift-301',
        title: 'Mekanik Klavye Custom Keycap Set',
        estimatedPrice: 900,
        currency: '₺',
        notes: 'Retro gri-turuncu tema istiyordu.',
        priority: 'high',
        isPurchased: false,
        createdAt: '2026-08-20T11:00:00.000Z'
      }
    ],
    givenGifts: [
      {
        id: 'given-301',
        year: 2025,
        title: 'Deri Mousepad & Kablo Düzenleyici',
        price: 320,
        notes: 'Ofis masası için.',
        createdAt: '2025-10-03T10:00:00.000Z'
      }
    ],
    receivedGifts: [
      {
        id: 'rec-301',
        year: 2025,
        title: 'Steam Hediye Çeki (50$)',
        notes: 'Birlikte oynadığımız oyun için almıştı.',
        createdAt: '2025-05-15T10:00:00.000Z'
      }
    ],
    createdAt: '2026-02-01T10:00:00.000Z',
    updatedAt: '2026-09-18T10:00:00.000Z'
  },
  {
    id: 'friend-4',
    name: 'Zeynep Kaya',
    birthDate: '2001-10-18',
    includeYear: true,
    avatarColor: '#10B981', // Emerald
    phone: '+90 530 444 8899',
    notes: 'Kuzenim. Mimarlık öğrencisi.',
    notifications: {
      enabled: true,
      onDay: true,
      oneDayBefore: true,
      threeDaysBefore: false,
      oneWeekBefore: true,
      time: '09:00'
    },
    giftIdeas: [
      {
        id: 'gift-401',
        title: 'Rotring Rapid Pro Teknik Çizim Kalemi',
        estimatedPrice: 850,
        currency: '₺',
        priority: 'medium',
        isPurchased: false,
        createdAt: '2026-09-05T10:00:00.000Z'
      }
    ],
    givenGifts: [],
    receivedGifts: [],
    createdAt: '2026-03-01T10:00:00.000Z',
    updatedAt: '2026-09-05T10:00:00.000Z'
  },
  {
    id: 'friend-5',
    name: 'Burak Şahin',
    birthDate: '1993-11-14',
    includeYear: true,
    avatarColor: '#8B5CF6', // Purple
    phone: '+90 535 777 1122',
    notes: 'Doğa yürüyüşü ve fotoğraf tutkunu.',
    notifications: {
      enabled: true,
      onDay: true,
      oneDayBefore: false,
      threeDaysBefore: true,
      oneWeekBefore: true,
      time: '09:00'
    },
    giftIdeas: [
      {
        id: 'gift-501',
        title: 'Kamera Lens Temizleme Kiti & Taşıma Çantası',
        estimatedPrice: 400,
        currency: '₺',
        priority: 'low',
        isPurchased: false,
        createdAt: '2026-09-01T08:00:00.000Z'
      }
    ],
    givenGifts: [
      {
        id: 'given-501',
        year: 2025,
        title: 'Dağcılık Matarası',
        price: 280,
        notes: 'Birlikte Uludağ zirveye çıkmıştık.',
        createdAt: '2025-11-15T09:00:00.000Z'
      }
    ],
    receivedGifts: [],
    createdAt: '2026-02-15T10:00:00.000Z',
    updatedAt: '2026-09-01T08:00:00.000Z'
  }
];

export function loadFriendsFromStorage(): Friend[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FRIENDS);
    if (!raw) {
      saveFriendsToStorage(DEFAULT_FRIENDS);
      return DEFAULT_FRIENDS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    saveFriendsToStorage(DEFAULT_FRIENDS);
    return DEFAULT_FRIENDS;
  } catch (err) {
    console.error('Failed to load friends from storage:', err);
    return DEFAULT_FRIENDS;
  }
}

export function saveFriendsToStorage(friends: Friend[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_FRIENDS, JSON.stringify(friends));
  } catch (err) {
    console.error('Failed to save friends to storage:', err);
  }
}

export function loadNotificationsFromStorage(): AppNotificationLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveNotificationsToStorage(logs: AppNotificationLog[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(logs.slice(0, 50))); // keep latest 50
  } catch (err) {
    console.error('Failed to save notification logs:', err);
  }
}

export function exportBackupJSON(friends: Friend[]): void {
  const data = {
    appName: 'Doğum Günü & Hediye Hatırlatıcı',
    version: '1.0',
    exportDate: new Date().toISOString(),
    friends
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `dogum-gunu-yedek-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function resetToDefaults(): Friend[] {
  saveFriendsToStorage(DEFAULT_FRIENDS);
  return DEFAULT_FRIENDS;
}
