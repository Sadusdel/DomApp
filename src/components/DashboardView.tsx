import React, { useState, useMemo } from 'react';
import { Friend } from '../types';
import { Avatar } from './Avatar';
import {
  sortFriendsByUpcomingBirthday,
  formatBirthdayTurkish,
  getZodiacSign,
  parseBirthDate,
  getNextAge,
  getUpcomingBirthdayLabel
} from '../utils/birthdayUtils';
import {
  Search,
  Gift,
  Bell,
  Sparkles,
  Calendar,
  MessageCircle,
  Clock,
  CheckCircle2,
  Plus
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DashboardViewProps {
  friends: Friend[];
  onSelectFriend: (friend: Friend) => void;
  onOpenAddFriend: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  friends,
  onSelectFriend,
  onOpenAddFriend
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'week' | 'month' | 'noGifts'>('all');

  const sortedFriends = useMemo(() => {
    return sortFriendsByUpcomingBirthday(friends);
  }, [friends]);

  // Check if someone has birthday today
  const todayBirthdays = useMemo(() => {
    return sortedFriends.filter(f => f.daysUntil === 0);
  }, [sortedFriends]);

  // Statistics
  const stats = useMemo(() => {
    const thisWeek = sortedFriends.filter(f => f.daysUntil <= 7).length;
    const thisMonth = sortedFriends.filter(f => f.daysUntil <= 30).length;
    const totalGiftsPlanned = friends.reduce((acc, f) => acc + (f.giftIdeas?.length || 0), 0);
    return { thisWeek, thisMonth, totalGiftsPlanned };
  }, [sortedFriends, friends]);

  // Filtered friends
  const filteredFriends = useMemo(() => {
    return sortedFriends.filter(friend => {
      // Search
      const matchesSearch = friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (friend.notes && friend.notes.toLowerCase().includes(searchQuery.toLowerCase()));
      if (!matchesSearch) return false;

      // Category filter
      if (activeFilter === 'week') return friend.daysUntil <= 7;
      if (activeFilter === 'month') return friend.daysUntil <= 30;
      if (activeFilter === 'noGifts') return (!friend.giftIdeas || friend.giftIdeas.length === 0);
      return true;
    });
  }, [sortedFriends, searchQuery, activeFilter]);

  const triggerCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleShareGreeting = (friend: Friend, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextAge = getNextAge(friend.birthDate, friend.includeYear);
    const ageText = nextAge ? ` ${nextAge}. yaşın` : '';
    const message = `🎉 Doğum günün kutlu olsun ${friend.name}! Yeni yaşında${ageText} sağlık, mutluluk ve tüm dileklerinin gerçekleşmesini dilerim! 🎂🎈`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(message);
      alert(`Kutlama mesajı panoya kopyalandı:\n"${message}"`);
    } else {
      alert(message);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Today's Birthday Celebration Banner (If any) */}
      {todayBirthdays.length > 0 && (
        <div className="rounded-2xl p-5 bg-gradient-to-r from-amber-500 via-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/20 relative overflow-hidden">
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/25 backdrop-blur-xs text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Bugün Doğum Günü!</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                {todayBirthdays.map(f => f.name).join(', ')} için kutlama vakti! 🎂
              </h2>
              <p className="text-amber-100 text-xs sm:text-sm">
                Sevdiklerine sıcacık bir tebrik mesajı göndermeyi ve hediyeni vermeyi unutma.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={triggerCelebration}
                className="px-4 py-2 rounded-xl bg-white text-rose-600 font-semibold text-sm shadow-md hover:bg-amber-50 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Konfeti Patlat 🎉</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 mb-1">
            <span className="text-xs font-medium">Bu Hafta</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100">
            {stats.thisWeek}
            <span className="text-xs font-normal text-stone-500 ml-1">kişi</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 mb-1">
            <span className="text-xs font-medium">Bu Ay</span>
            <Calendar className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100">
            {stats.thisMonth}
            <span className="text-xs font-normal text-stone-500 ml-1">kişi</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 mb-1">
            <span className="text-xs font-medium">Hediye Fikirleri</span>
            <Gift className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100">
            {stats.totalGiftsPlanned}
            <span className="text-xs font-normal text-stone-500 ml-1">kayıt</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 mb-1">
            <span className="text-xs font-medium">Kayıtlı Arkadaş</span>
            <Sparkles className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100">
            {friends.length}
            <span className="text-xs font-normal text-stone-500 ml-1">toplam</span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="İsim veya notlarda ara..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 transition-all placeholder:text-stone-400"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-800 hover:bg-stone-50'
            }`}
          >
            Tüm Arkadaşlar ({friends.length})
          </button>
          <button
            onClick={() => setActiveFilter('week')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
              activeFilter === 'week'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-800 hover:bg-stone-50'
            }`}
          >
            Bu Hafta ({stats.thisWeek})
          </button>
          <button
            onClick={() => setActiveFilter('month')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
              activeFilter === 'month'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-800 hover:bg-stone-50'
            }`}
          >
            Bu Ay ({stats.thisMonth})
          </button>
          <button
            onClick={() => setActiveFilter('noGifts')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
              activeFilter === 'noGifts'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-800 hover:bg-stone-50'
            }`}
          >
            Hediye Fikri Bekleyenler
          </button>
        </div>
      </div>

      {/* Friends List - Chronological Order */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
            Kronolojik Doğum Günü Sırası
          </h3>
          <span className="text-xs text-stone-400">
            {filteredFriends.length} kişi listeleniyor
          </span>
        </div>

        {filteredFriends.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3">
            <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
              <Calendar className="w-6 h-6" />
            </div>
            <h4 className="text-base font-semibold text-stone-800 dark:text-stone-200">
              Kayıt Bulunamadı
            </h4>
            <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
              Arama kriterlerine uyan arkadaş bulunamadı. Yeni bir arkadaş ekleyebilir veya filtreyi değiştirebilirsiniz.
            </p>
            <button
              onClick={onOpenAddFriend}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-semibold shadow-xs hover:bg-amber-700 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Arkadaş Ekle</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredFriends.map(friend => {
              const { month, day } = parseBirthDate(friend.birthDate);
              const zodiac = getZodiacSign(month, day);
              const nextAge = getNextAge(friend.birthDate, friend.includeYear);
              const countdown = getUpcomingBirthdayLabel(friend.daysUntil);
              const giftCount = friend.giftIdeas?.length || 0;
              const purchasedCount = friend.giftIdeas?.filter(g => g.isPurchased).length || 0;

              return (
                <div
                  key={friend.id}
                  onClick={() => onSelectFriend(friend)}
                  className={`group relative p-4 rounded-2xl bg-white dark:bg-stone-900 border transition-all cursor-pointer hover:shadow-md ${
                    countdown.isToday
                      ? 'border-rose-300 dark:border-rose-900/60 bg-gradient-to-br from-rose-50/50 to-amber-50/40 dark:from-rose-950/20 dark:to-stone-900'
                      : 'border-stone-200/80 dark:border-stone-800 hover:border-amber-300 dark:hover:border-stone-700'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <Avatar
                        name={friend.name}
                        avatarUrl={friend.avatarUrl}
                        avatarColor={friend.avatarColor}
                        size="md"
                      />
                      {friend.notifications?.enabled && (
                        <div
                          title="Bildirimler Aktif"
                          className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-stone-900 flex items-center justify-center text-white"
                        >
                          <Bell className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>

                    {/* Friend Information */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-base font-bold text-stone-900 dark:text-stone-100 truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                          {friend.name}
                        </h4>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0 ${countdown.badgeColor}`}>
                          {countdown.text}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-xs text-stone-500 dark:text-stone-400">
                        <span className="font-medium text-stone-700 dark:text-stone-300">
                          {formatBirthdayTurkish(friend.birthDate, friend.includeYear)}
                        </span>
                        {nextAge && (
                          <span className="text-amber-700 dark:text-amber-400 font-semibold">
                            ({nextAge}. yaş)
                          </span>
                        )}
                        <span className="inline-flex items-center gap-0.5 text-stone-400">
                          <span>{zodiac.symbol}</span>
                          <span>{zodiac.name}</span>
                        </span>
                      </div>

                      {/* Gift summary & actions */}
                      <div className="mt-3 pt-2.5 border-t border-stone-100 dark:border-stone-800/60 flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-1.5 text-stone-600 dark:text-stone-400">
                          <Gift className="w-3.5 h-3.5 text-amber-500" />
                          {giftCount > 0 ? (
                            <span>
                              {giftCount} Fikir {purchasedCount > 0 && `(${purchasedCount} Alındı)`}
                            </span>
                          ) : (
                            <span className="text-stone-400 italic">Hediye fikri henüz yok</span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          {countdown.isToday && (
                            <button
                              onClick={(e) => handleShareGreeting(friend, e)}
                              title="Tebrik mesajı hazırla"
                              className="px-2 py-1 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 hover:bg-rose-200 transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <MessageCircle className="w-3 h-3" />
                              <span>Kutla</span>
                            </button>
                          )}
                          <span className="text-amber-600 dark:text-amber-400 font-semibold group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-0.5">
                            Detay &rarr;
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
