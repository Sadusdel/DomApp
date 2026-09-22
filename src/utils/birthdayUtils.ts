import { Friend } from '../types';

export interface ZodiacInfo {
  name: string;
  symbol: string;
  dates: string;
}

export const MONTH_NAMES_TR = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

export const WEEKDAY_NAMES_TR = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

export function parseBirthDate(dateStr: string): { year: number; month: number; day: number } {
  const parts = dateStr.split('-');
  const year = parseInt(parts[0], 10) || 2000;
  const month = parseInt(parts[1], 10) || 1;
  const day = parseInt(parts[2], 10) || 1;
  return { year, month, day };
}

export function formatBirthdayTurkish(dateStr: string, includeYear = true): string {
  const { year, month, day } = parseBirthDate(dateStr);
  const monthName = MONTH_NAMES_TR[month - 1] || '';
  if (includeYear && year > 1900) {
    return `${day} ${monthName} ${year}`;
  }
  return `${day} ${monthName}`;
}

export function getZodiacSign(month: number, day: number): ZodiacInfo {
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) {
    return { name: 'Koç', symbol: '♈', dates: '21 Mar - 19 Nis' };
  }
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) {
    return { name: 'Boğa', symbol: '♉', dates: '20 Nis - 20 May' };
  }
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) {
    return { name: 'İkizler', symbol: '♊', dates: '21 May - 20 Haz' };
  }
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) {
    return { name: 'Yengeç', symbol: '♋', dates: '21 Haz - 22 Tem' };
  }
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) {
    return { name: 'Aslan', symbol: '♌', dates: '23 Tem - 22 Ağu' };
  }
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) {
    return { name: 'Başak', symbol: '♍', dates: '23 Ağu - 22 Eyl' };
  }
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) {
    return { name: 'Terazi', symbol: '♎', dates: '23 Eyl - 22 Eki' };
  }
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) {
    return { name: 'Akrep', symbol: '♏', dates: '23 Eki - 21 Kas' };
  }
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) {
    return { name: 'Yay', symbol: '♐', dates: '22 Kas - 21 Ara' };
  }
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) {
    return { name: 'Oğlak', symbol: '♑', dates: '22 Ara - 19 Oca' };
  }
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) {
    return { name: 'Kova', symbol: '♒', dates: '20 Oca - 18 Şub' };
  }
  return { name: 'Balık', symbol: '♓', dates: '19 Şub - 20 Mar' };
}

/**
 * Calculates days remaining until the next birthday from a given base date (defaults to today).
 * If today is their birthday, returns 0.
 */
export function getDaysUntilBirthday(dateStr: string, fromDate = new Date()): number {
  const { month, day } = parseBirthDate(dateStr);
  const currentYear = fromDate.getFullYear();

  // Create birthday date in current year at midnight
  const targetDate = new Date(currentYear, month - 1, day);
  const todayAtMidnight = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());

  // If already passed this year, look at next year
  if (targetDate.getTime() < todayAtMidnight.getTime()) {
    targetDate.setFullYear(currentYear + 1);
  }

  const diffMs = targetDate.getTime() - todayAtMidnight.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export function getNextAge(birthDateStr: string, includeYear = true): number | null {
  if (!includeYear) return null;
  const { year, month, day } = parseBirthDate(birthDateStr);
  if (year <= 1900) return null;

  const today = new Date();
  const nextBirthdayYear = today.getFullYear();
  const birthdayPassed = (today.getMonth() + 1 > month) || (today.getMonth() + 1 === month && today.getDate() > day);
  
  const targetYear = birthdayPassed ? nextBirthdayYear + 1 : nextBirthdayYear;
  return targetYear - year;
}

export function getCurrentAge(birthDateStr: string, includeYear = true): number | null {
  if (!includeYear) return null;
  const { year, month, day } = parseBirthDate(birthDateStr);
  if (year <= 1900) return null;

  const today = new Date();
  let age = today.getFullYear() - year;
  const monthDiff = today.getMonth() + 1 - month;
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < day)) {
    age--;
  }
  return age;
}

export function getUpcomingBirthdayLabel(daysUntil: number): { text: string; badgeColor: string; isToday: boolean } {
  if (daysUntil === 0) {
    return { text: 'BUGÜN! 🎉', badgeColor: 'bg-rose-500 text-white animate-pulse', isToday: true };
  }
  if (daysUntil === 1) {
    return { text: 'Yarın 🎈', badgeColor: 'bg-amber-500 text-white', isToday: false };
  }
  if (daysUntil <= 7) {
    return { text: `${daysUntil} gün kaldı`, badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300', isToday: false };
  }
  if (daysUntil <= 30) {
    return { text: `${daysUntil} gün kaldı`, badgeColor: 'bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300', isToday: false };
  }
  return { text: `${daysUntil} gün`, badgeColor: 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300', isToday: false };
}

export function sortFriendsByUpcomingBirthday(friends: Friend[]): Array<Friend & { daysUntil: number }> {
  return friends
    .map(f => ({
      ...f,
      daysUntil: getDaysUntilBirthday(f.birthDate)
    }))
    .sort((a, b) => a.daysUntil - b.daysUntil);
}
