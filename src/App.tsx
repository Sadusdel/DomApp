/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Friend } from './types';
import {
  loadFriendsFromStorage,
  saveFriendsToStorage,
  loadNotificationsFromStorage
} from './utils/storage';
import { checkUpcomingBirthdaysForNotifications } from './utils/notifications';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { CalendarView } from './components/CalendarView';
import { GiftsPoolView } from './components/GiftsPoolView';
import { FriendDetailModal } from './components/FriendDetailModal';
import { FriendFormModal } from './components/FriendFormModal';
import { NotificationCenterModal } from './components/NotificationCenterModal';
import { SettingsModal } from './components/SettingsModal';
import { Smartphone, Monitor } from 'lucide-react';

export default function App() {
  const [friends, setFriends] = useState<Friend[]>(() => loadFriendsFromStorage());
  const [activeTab, setActiveTab] = useState<'dashboard' | 'calendar' | 'gifts'>('dashboard');

  // Modal states
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [isAddingFriend, setIsAddingFriend] = useState(false);
  const [editingFriend, setEditingFriend] = useState<Friend | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  // Optional mobile-device frame simulator toggle for authentic mobile experience
  const [isMobileFrame, setIsMobileFrame] = useState(false);

  // Sync unread notification count
  const refreshUnreadCount = useCallback(() => {
    const logs = loadNotificationsFromStorage();
    const unread = logs.filter(l => !l.isRead).length;
    setUnreadNotificationCount(unread);
  }, []);

  // Save changes to storage
  const handleUpdateFriends = (updatedList: Friend[]) => {
    setFriends(updatedList);
    saveFriendsToStorage(updatedList);
  };

  // Single friend update
  const handleUpdateFriend = (updatedFriend: Friend) => {
    const updatedList = friends.map(f => (f.id === updatedFriend.id ? updatedFriend : f));
    handleUpdateFriends(updatedList);
    setSelectedFriend(updatedFriend);
  };

  // Delete friend
  const handleDeleteFriend = (friendId: string) => {
    if (!confirm('Bu arkadaşı silmek istediğinize emin misiniz?')) return;
    const updatedList = friends.filter(f => f.id !== friendId);
    handleUpdateFriends(updatedList);
    setSelectedFriend(null);
  };

  // Save new or edited friend from Form
  const handleSaveFriendFromForm = (savedFriend: Friend) => {
    const exists = friends.some(f => f.id === savedFriend.id);
    let updatedList: Friend[];
    if (exists) {
      updatedList = friends.map(f => (f.id === savedFriend.id ? savedFriend : f));
    } else {
      updatedList = [savedFriend, ...friends];
    }
    handleUpdateFriends(updatedList);
    setIsAddingFriend(false);
    setEditingFriend(null);
    setSelectedFriend(savedFriend);
  };

  // Initial notification check on mount & periodic interval
  useEffect(() => {
    refreshUnreadCount();
    // Check reminders on load
    checkUpcomingBirthdaysForNotifications(friends);
    refreshUnreadCount();

    // Check periodically every 15 minutes if app remains open
    const interval = setInterval(() => {
      checkUpcomingBirthdaysForNotifications(friends);
      refreshUnreadCount();
    }, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, [friends, refreshUnreadCount]);

  return (
    <div className="min-h-screen bg-stone-100/70 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col items-center">
      {/* Viewport Frame Container */}
      <div
        className={`w-full transition-all duration-300 ${
          isMobileFrame
            ? 'max-w-md my-4 shadow-2xl rounded-3xl border-4 border-stone-800 bg-white dark:bg-stone-900 overflow-hidden'
            : 'max-w-4xl bg-white dark:bg-stone-900 min-h-screen shadow-xs'
        }`}
      >
        {/* Responsive layout toggle for mobile simulator */}
        <div className="bg-stone-900 text-stone-300 text-[11px] px-4 py-1.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Çevrimdışı Mod Aktif (Lokal Hafıza)</span>
          </div>

          <button
            onClick={() => setIsMobileFrame(prev => !prev)}
            className="flex items-center gap-1 text-stone-300 hover:text-white transition-colors cursor-pointer"
            title={isMobileFrame ? 'Genişletilmiş masaüstü moduna geç' : 'Mobil cihaz çerçevesine geç'}
          >
            {isMobileFrame ? (
              <>
                <Monitor className="w-3.5 h-3.5" />
                <span>Geniş Görünüm</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobil Çerçeve</span>
              </>
            )}
          </button>
        </div>

        {/* Top Header */}
        <Header
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenAddFriend={() => {
            setEditingFriend(null);
            setIsAddingFriend(true);
          }}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          unreadCount={unreadNotificationCount}
          totalFriends={friends.length}
        />

        {/* Main Content Area */}
        <main className="p-4 sm:p-6">
          {activeTab === 'dashboard' && (
            <DashboardView
              friends={friends}
              onSelectFriend={setSelectedFriend}
              onOpenAddFriend={() => {
                setEditingFriend(null);
                setIsAddingFriend(true);
              }}
            />
          )}

          {activeTab === 'calendar' && (
            <CalendarView
              friends={friends}
              onSelectFriend={setSelectedFriend}
            />
          )}

          {activeTab === 'gifts' && (
            <GiftsPoolView
              friends={friends}
              onSelectFriend={setSelectedFriend}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      {/* 1. Friend Detail Profile Modal */}
      {selectedFriend && (
        <FriendDetailModal
          friend={selectedFriend}
          onClose={() => setSelectedFriend(null)}
          onUpdateFriend={handleUpdateFriend}
          onDeleteFriend={handleDeleteFriend}
          onOpenEditForm={friend => {
            setSelectedFriend(null);
            setEditingFriend(friend);
          }}
        />
      )}

      {/* 2. Add / Edit Friend Modal */}
      {(isAddingFriend || editingFriend) && (
        <FriendFormModal
          initialFriend={editingFriend}
          onSave={handleSaveFriendFromForm}
          onClose={() => {
            setIsAddingFriend(false);
            setEditingFriend(null);
          }}
        />
      )}

      {/* 3. Notification Center Modal */}
      {isNotificationsOpen && (
        <NotificationCenterModal
          friends={friends}
          onClose={() => setIsNotificationsOpen(false)}
          onClearUnread={() => setUnreadNotificationCount(0)}
        />
      )}

      {/* 4. Settings & Storage Modal */}
      {isSettingsOpen && (
        <SettingsModal
          friends={friends}
          onUpdateAllFriends={handleUpdateFriends}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </div>
  );
}
