export type Priority = 'low' | 'medium' | 'high';

export interface NotificationConfig {
  enabled: boolean;
  onDay: boolean; // Tam gününde
  oneDayBefore: boolean; // 1 gün önce
  threeDaysBefore: boolean; // 3 gün önce
  oneWeekBefore: boolean; // 1 hafta önce
  time: string; // "09:00"
}

export interface GiftIdea {
  id: string;
  title: string;
  estimatedPrice?: number;
  currency?: string;
  url?: string;
  notes?: string;
  priority: Priority;
  isPurchased: boolean;
  createdAt: string;
}

export interface GiftHistoryItem {
  id: string;
  year: number;
  title: string;
  price?: number;
  notes?: string;
  createdAt: string;
}

export interface Friend {
  id: string;
  name: string;
  birthDate: string; // YYYY-MM-DD
  includeYear: boolean;
  avatarUrl?: string;
  avatarColor?: string;
  phone?: string;
  notes?: string;
  notifications: NotificationConfig;
  giftIdeas: GiftIdea[];
  givenGifts: GiftHistoryItem[]; // Ona aldıklarım
  receivedGifts: GiftHistoryItem[]; // Bana aldıkları
  createdAt: string;
  updatedAt: string;
}

export interface AppNotificationLog {
  id: string;
  friendId: string;
  friendName: string;
  title: string;
  body: string;
  triggerType: 'on_day' | '1_day_before' | '3_days_before' | '1_week_before' | 'test';
  timestamp: string;
  isRead: boolean;
}
