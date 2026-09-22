import React from 'react';
import { Cake, Calendar, Gift, Bell, Plus, Settings, Users } from 'lucide-react';

interface HeaderProps {
  activeTab: 'dashboard' | 'calendar' | 'gifts';
  onTabChange: (tab: 'dashboard' | 'calendar' | 'gifts') => void;
  onOpenAddFriend: () => void;
  onOpenNotifications: () => void;
  onOpenSettings: () => void;
  unreadCount: number;
  totalFriends: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onOpenAddFriend,
  onOpenNotifications,
  onOpenSettings,
  unreadCount,
  totalFriends
}) => {
  return (
    <header className="sticky top-0 z-30 bg-amber-50/90 dark:bg-stone-900/90 backdrop-blur-md border-b border-amber-200/60 dark:border-stone-800">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-3">
          {/* Logo and Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
              <Cake className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 tracking-tight">
                  Doğum Günü & Hediye
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                  {totalFriends} Arkadaş
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 hidden xs:block">
                Özel günleri ve hediye fikirlerini asla unutma
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenNotifications}
              title="Hatırlatıcılar & Bildirimler"
              className="relative p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-amber-100/70 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={onOpenSettings}
              title="Yedekleme ve Ayarlar"
              className="p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-amber-100/70 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <Settings className="w-5 h-5" />
            </button>

            <button
              onClick={onOpenAddFriend}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 text-white font-medium text-sm shadow-md shadow-amber-600/20 transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Arkadaş Ekle</span>
              <span className="sm:hidden">Ekle</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center justify-center sm:justify-start gap-1 mt-2.5 pt-2 border-t border-amber-200/40 dark:border-stone-800/80">
          <button
            onClick={() => onTabChange('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-amber-200/70 dark:bg-stone-800 text-stone-900 dark:text-amber-300 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-amber-100/40 dark:hover:bg-stone-800/40'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Yaklaşanlar</span>
          </button>

          <button
            onClick={() => onTabChange('calendar')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              activeTab === 'calendar'
                ? 'bg-amber-200/70 dark:bg-stone-800 text-stone-900 dark:text-amber-300 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-amber-100/40 dark:hover:bg-stone-800/40'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Takvim</span>
          </button>

          <button
            onClick={() => onTabChange('gifts')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              activeTab === 'gifts'
                ? 'bg-amber-200/70 dark:bg-stone-800 text-stone-900 dark:text-amber-300 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-amber-100/40 dark:hover:bg-stone-800/40'
            }`}
          >
            <Gift className="w-4 h-4" />
            <span>Hediye Havuzu</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
