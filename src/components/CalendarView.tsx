import React, { useState, useMemo } from 'react';
import { Friend } from '../types';
import { Avatar } from './Avatar';
import {
  MONTH_NAMES_TR,
  WEEKDAY_NAMES_TR,
  parseBirthDate,
  getZodiacSign,
  getNextAge,
  getUpcomingBirthdayLabel
} from '../utils/birthdayUtils';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  LayoutGrid,
  Gift,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface CalendarViewProps {
  friends: Friend[];
  onSelectFriend: (friend: Friend) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  friends,
  onSelectFriend
}) => {
  const today = useMemo(() => new Date(), []);
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth()); // 0-indexed (0 = Ocak)
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());
  const [viewMode, setViewMode] = useState<'monthly' | 'annual'>('monthly');

  // Map friends by "month-day" for fast lookup
  const friendsByMonthDay = useMemo(() => {
    const map = new Map<string, Friend[]>();
    friends.forEach(f => {
      const { month, day } = parseBirthDate(f.birthDate);
      const key = `${month}-${day}`;
      const existing = map.get(key) || [];
      existing.push(f);
      map.set(key, existing);
    });
    return map;
  }, [friends]);

  // Calculations for current month view
  const monthData = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const totalDays = lastDayOfMonth.getDate();

    // JS getDay(): 0 is Sunday, 1 is Monday... We want Monday = 0
    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const days = [];
    // Leading empty slots
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push({ day: null, key: `empty-start-${i}` });
    }
    // Days of the month
    for (let d = 1; d <= totalDays; d++) {
      const key = `${currentMonth + 1}-${d}`;
      const dayFriends = friendsByMonthDay.get(key) || [];
      const isToday =
        today.getFullYear() === currentYear &&
        today.getMonth() === currentMonth &&
        today.getDate() === d;

      days.push({
        day: d,
        key: `day-${d}`,
        friends: dayFriends,
        isToday
      });
    }

    return { days, totalDays };
  }, [currentYear, currentMonth, friendsByMonthDay, today]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
    setSelectedDay(null);
  };

  const handleGoToToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDay(today.getDate());
  };

  // Friends celebrating on the selected day
  const selectedDayFriends = useMemo(() => {
    if (selectedDay === null) return [];
    const key = `${currentMonth + 1}-${selectedDay}`;
    return friendsByMonthDay.get(key) || [];
  }, [selectedDay, currentMonth, friendsByMonthDay]);

  return (
    <div className="space-y-6 pb-12">
      {/* Calendar Top Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('monthly')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'monthly'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Aylık Detay</span>
            </button>
            <button
              onClick={() => setViewMode('annual')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'annual'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>12 Ay Genel Bakış</span>
            </button>
          </div>

          <button
            onClick={handleGoToToday}
            className="px-3 py-1.5 rounded-xl border border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-xs font-semibold hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors cursor-pointer"
          >
            Bugün
          </button>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 transition-colors cursor-pointer"
            title="Önceki Ay"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 min-w-[140px] text-center">
            {MONTH_NAMES_TR[currentMonth]} {currentYear}
          </h2>

          <button
            onClick={handleNextMonth}
            className="p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 transition-colors cursor-pointer"
            title="Sonraki Ay"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {viewMode === 'monthly' ? (
        /* Detailed Month Calendar */
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-xs overflow-hidden">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-950/40 text-center py-2.5">
            {WEEKDAY_NAMES_TR.map((wd, idx) => (
              <span
                key={wd}
                className={`text-xs font-semibold ${
                  idx >= 5 ? 'text-amber-600 dark:text-amber-500' : 'text-stone-500 dark:text-stone-400'
                }`}
              >
                {wd}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 divide-x divide-y divide-stone-100 dark:divide-stone-800/60">
            {monthData.days.map(item => {
              if (!item.day) {
                return (
                  <div
                    key={item.key}
                    className="min-h-[70px] sm:min-h-[88px] p-1.5 bg-stone-50/30 dark:bg-stone-950/20"
                  />
                );
              }

              const hasBirthdays = item.friends && item.friends.length > 0;
              const isSelected = selectedDay === item.day;

              return (
                <div
                  key={item.key}
                  onClick={() => setSelectedDay(item.day)}
                  className={`min-h-[70px] sm:min-h-[88px] p-1.5 sm:p-2 transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-amber-50/80 dark:bg-stone-800/90 ring-2 ring-amber-500/50'
                      : 'hover:bg-stone-50 dark:hover:bg-stone-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full ${
                        item.isToday
                          ? 'bg-rose-500 text-white shadow-xs'
                          : isSelected
                          ? 'bg-amber-600 text-white'
                          : 'text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      {item.day}
                    </span>

                    {hasBirthdays && (
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                      </span>
                    )}
                  </div>

                  {/* Friends badge preview inside day cell */}
                  {hasBirthdays && (
                    <div className="mt-1 space-y-1">
                      {item.friends.slice(0, 2).map(f => (
                        <div
                          key={f.id}
                          className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-100/90 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 text-[10px] font-medium truncate"
                        >
                          <span>🎂</span>
                          <span className="truncate">{f.name.split(' ')[0]}</span>
                        </div>
                      ))}
                      {item.friends.length > 2 && (
                        <span className="text-[9px] font-bold text-amber-700 dark:text-amber-400 block text-right">
                          +{item.friends.length - 2} kişi
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* 12 Months Annual Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {MONTH_NAMES_TR.map((monthName, mIndex) => {
            // Calculate birthdays count for this month
            let monthBirthdayCount = 0;
            const monthFriends: Friend[] = [];
            friends.forEach(f => {
              const { month } = parseBirthDate(f.birthDate);
              if (month === mIndex + 1) {
                monthBirthdayCount++;
                monthFriends.push(f);
              }
            });

            const isCurrentMonth = today.getMonth() === mIndex && today.getFullYear() === currentYear;

            return (
              <div
                key={monthName}
                onClick={() => {
                  setCurrentMonth(mIndex);
                  setViewMode('monthly');
                }}
                className={`p-4 rounded-2xl bg-white dark:bg-stone-900 border transition-all cursor-pointer hover:shadow-md hover:border-amber-400 ${
                  isCurrentMonth
                    ? 'border-amber-400 dark:border-amber-600 ring-1 ring-amber-400/40 bg-gradient-to-br from-amber-50/40 to-white dark:from-stone-900 dark:to-stone-800'
                    : 'border-stone-200/80 dark:border-stone-800'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                    <span>{monthName}</span>
                    {isCurrentMonth && (
                      <span className="px-1.5 py-0.2 rounded-sm bg-amber-500 text-white text-[10px]">
                        Bu Ay
                      </span>
                    )}
                  </h3>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      monthBirthdayCount > 0
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-400'
                    }`}
                  >
                    {monthBirthdayCount} Doğum Günü
                  </span>
                </div>

                {/* Mini representation of birthdays */}
                {monthFriends.length > 0 ? (
                  <div className="space-y-1.5">
                    {monthFriends.slice(0, 3).map(f => {
                      const { day } = parseBirthDate(f.birthDate);
                      return (
                        <div
                          key={f.id}
                          className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-stone-50 dark:bg-stone-800/60"
                        >
                          <span className="font-medium text-stone-800 dark:text-stone-200 truncate">
                            {f.name}
                          </span>
                          <span className="text-stone-400 shrink-0 font-semibold text-[11px]">
                            {day} {monthName}
                          </span>
                        </div>
                      );
                    })}
                    {monthFriends.length > 3 && (
                      <p className="text-[11px] text-stone-400 text-right font-medium">
                        +{monthFriends.length - 3} kişi daha...
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-stone-400 italic py-2">
                    Bu ayda kayıtlı doğum günü yok
                  </p>
                )}

                <div className="mt-3 pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-end text-xs text-amber-600 dark:text-amber-400 font-medium">
                  <span>Aya git &rarr;</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selected Day Friend Card Drawer (When in monthly view) */}
      {viewMode === 'monthly' && selectedDay !== null && (
        <div className="bg-amber-50/60 dark:bg-stone-900 p-5 rounded-2xl border border-amber-200 dark:border-stone-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>
                {selectedDay} {MONTH_NAMES_TR[currentMonth]} {currentYear} Doğum Günleri
              </span>
            </h3>
            <span className="text-xs text-stone-500">
              {selectedDayFriends.length} kişi bulundu
            </span>
          </div>

          {selectedDayFriends.length === 0 ? (
            <p className="text-xs text-stone-500 dark:text-stone-400 italic">
              Bu tarihte kayıtlı bir doğum günü bulunmuyor. Yeni bir arkadaş eklerken bu tarihi seçebilirsiniz.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {selectedDayFriends.map(friend => {
                const { month, day } = parseBirthDate(friend.birthDate);
                const zodiac = getZodiacSign(month, day);
                const nextAge = getNextAge(friend.birthDate, friend.includeYear);

                return (
                  <div
                    key={friend.id}
                    onClick={() => onSelectFriend(friend)}
                    className="p-3.5 rounded-xl bg-white dark:bg-stone-800 border border-amber-200/60 dark:border-stone-700 hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar
                        name={friend.name}
                        avatarUrl={friend.avatarUrl}
                        avatarColor={friend.avatarColor}
                        size="md"
                      />
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 truncate group-hover:text-amber-600 transition-colors">
                          {friend.name}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
                          {nextAge && <span>{nextAge}. Yaş Günü</span>}
                          <span>•</span>
                          <span>{zodiac.symbol} {zodiac.name}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-amber-600 font-semibold shrink-0">
                      <span>Profil</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
