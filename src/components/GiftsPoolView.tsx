import React, { useState, useMemo } from 'react';
import { Friend, GiftIdea } from '../types';
import { Avatar } from './Avatar';
import { Gift, CheckCircle2, Circle, ExternalLink, Filter, TrendingUp, Sparkles } from 'lucide-react';

interface GiftsPoolViewProps {
  friends: Friend[];
  onSelectFriend: (friend: Friend) => void;
}

export const GiftsPoolView: React.FC<GiftsPoolViewProps> = ({
  friends,
  onSelectFriend
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'purchased'>('pending');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  // Flatten all gift ideas with friend reference
  const allIdeas = useMemo(() => {
    const list: Array<{ idea: GiftIdea; friend: Friend }> = [];
    friends.forEach(f => {
      f.giftIdeas?.forEach(idea => {
        list.push({ idea, friend: f });
      });
    });
    return list;
  }, [friends]);

  // Statistics
  const stats = useMemo(() => {
    const totalGifts = allIdeas.length;
    const purchased = allIdeas.filter(item => item.idea.isPurchased).length;
    const pending = totalGifts - purchased;
    const totalEstimatedPendingBudget = allIdeas
      .filter(item => !item.idea.isPurchased)
      .reduce((acc, curr) => acc + (curr.idea.estimatedPrice || 0), 0);

    const totalGivenCount = friends.reduce((acc, f) => acc + (f.givenGifts?.length || 0), 0);
    const totalReceivedCount = friends.reduce((acc, f) => acc + (f.receivedGifts?.length || 0), 0);

    return { totalGifts, purchased, pending, totalEstimatedPendingBudget, totalGivenCount, totalReceivedCount };
  }, [allIdeas, friends]);

  // Filtered Ideas
  const filteredIdeas = useMemo(() => {
    return allIdeas.filter(({ idea }) => {
      if (filterStatus === 'pending' && idea.isPurchased) return false;
      if (filterStatus === 'purchased' && !idea.isPurchased) return false;
      if (priorityFilter !== 'all' && idea.priority !== priorityFilter) return false;
      return true;
    });
  }, [allIdeas, filterStatus, priorityFilter]);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
          <span className="text-xs text-stone-500 block mb-1">Bekleyen Fikirler</span>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {stats.pending}
            <span className="text-xs font-normal text-stone-400 ml-1">adet</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
          <span className="text-xs text-stone-500 block mb-1">Tahmini Bütçe</span>
          <div className="text-2xl font-bold text-stone-900 dark:text-stone-100">
            {stats.totalEstimatedPendingBudget}
            <span className="text-xs font-normal text-stone-400 ml-1">₺</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
          <span className="text-xs text-stone-500 block mb-1">Ona Aldıklarım (Arşiv)</span>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
            {stats.totalGivenCount}
            <span className="text-xs font-normal text-stone-400 ml-1">kayıt</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
          <span className="text-xs text-stone-500 block mb-1">Bana Aldıkları (Arşiv)</span>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {stats.totalReceivedCount}
            <span className="text-xs font-normal text-stone-400 ml-1">kayıt</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-stone-900 p-3.5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs">
        <div className="flex items-center gap-1.5 text-xs">
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              filterStatus === 'pending'
                ? 'bg-amber-600 text-white'
                : 'text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800'
            }`}
          >
            Alınacaklar ({stats.pending})
          </button>
          <button
            onClick={() => setFilterStatus('purchased')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              filterStatus === 'purchased'
                ? 'bg-amber-600 text-white'
                : 'text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800'
            }`}
          >
            Alınanlar ({stats.purchased})
          </button>
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              filterStatus === 'all'
                ? 'bg-amber-600 text-white'
                : 'text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800'
            }`}
          >
            Tümü ({stats.totalGifts})
          </button>
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-stone-400 font-medium">Öncelik:</span>
          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value as typeof priorityFilter)}
            className="px-2.5 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border-none text-xs focus:outline-hidden"
          >
            <option value="all">Tüm Öncelikler</option>
            <option value="high">Yüksek 🌟</option>
            <option value="medium">Orta</option>
            <option value="low">Düşük</option>
          </select>
        </div>
      </div>

      {/* Ideas Grid */}
      <div className="space-y-3">
        {filteredIdeas.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-2">
            <Gift className="w-8 h-8 text-stone-300 mx-auto" />
            <p className="text-sm font-semibold text-stone-700 dark:text-stone-300">
              Bu filtrede hediye fikri bulunamadı
            </p>
            <p className="text-xs text-stone-400 max-w-xs mx-auto">
              Arkadaş profillerini açarak yeni hediye fikirleri ekleyebilirsiniz.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredIdeas.map(({ idea, friend }) => (
              <div
                key={idea.id}
                onClick={() => onSelectFriend(friend)}
                className={`p-4 rounded-2xl bg-white dark:bg-stone-900 border transition-all cursor-pointer hover:shadow-md hover:border-amber-400 ${
                  idea.isPurchased
                    ? 'border-stone-200 dark:border-stone-800 opacity-60'
                    : 'border-stone-200/80 dark:border-stone-800'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar
                      name={friend.name}
                      avatarUrl={friend.avatarUrl}
                      avatarColor={friend.avatarColor}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 block truncate">
                        {friend.name} için
                      </span>
                      <h4
                        className={`text-sm font-bold text-stone-900 dark:text-stone-100 truncate ${
                          idea.isPurchased ? 'line-through text-stone-400' : ''
                        }`}
                      >
                        {idea.title}
                      </h4>
                    </div>
                  </div>

                  {idea.isPurchased ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold shrink-0">
                      Alındı ✓
                    </span>
                  ) : idea.priority === 'high' ? (
                    <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[10px] font-bold shrink-0">
                      Yüksek 🌟
                    </span>
                  ) : null}
                </div>

                {idea.notes && (
                  <p className="text-xs text-stone-500 dark:text-stone-400 mb-2 line-clamp-2">
                    {idea.notes}
                  </p>
                )}

                <div className="flex items-center justify-between text-xs pt-2 border-t border-stone-100 dark:border-stone-800">
                  <span className="font-semibold text-stone-700 dark:text-stone-300">
                    {idea.estimatedPrice ? `${idea.estimatedPrice} ₺` : 'Fiyat belirtilmemiş'}
                  </span>
                  <span className="text-amber-600 dark:text-amber-400 font-medium">
                    Profile git &rarr;
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
