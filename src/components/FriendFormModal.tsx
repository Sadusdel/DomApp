import React, { useState, useRef } from 'react';
import { Friend, NotificationConfig } from '../types';
import { Avatar } from './Avatar';
import { X, Upload, Camera, Trash2, Calendar, Bell } from 'lucide-react';

interface FriendFormModalProps {
  initialFriend?: Friend | null;
  onSave: (friend: Friend) => void;
  onClose: () => void;
}

const PRESET_COLORS = [
  '#F97316', // Orange
  '#EC4899', // Pink
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#8B5CF6', // Purple
  '#EAB308', // Amber
  '#06B6D4', // Cyan
  '#EF4444'  // Red
];

export const FriendFormModal: React.FC<FriendFormModalProps> = ({
  initialFriend,
  onSave,
  onClose
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(initialFriend?.name || '');
  const [birthDate, setBirthDate] = useState(initialFriend?.birthDate || '1998-05-15');
  const [includeYear, setIncludeYear] = useState(initialFriend?.includeYear ?? true);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(initialFriend?.avatarUrl);
  const [avatarColor, setAvatarColor] = useState<string>(initialFriend?.avatarColor || PRESET_COLORS[0]);
  const [phone, setPhone] = useState(initialFriend?.phone || '');
  const [notes, setNotes] = useState(initialFriend?.notes || '');

  // Notifications default
  const [notifications, setNotifications] = useState<NotificationConfig>(
    initialFriend?.notifications || {
      enabled: true,
      onDay: true,
      oneDayBefore: true,
      threeDaysBefore: false,
      oneWeekBefore: true,
      time: '09:00'
    }
  );

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (< 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Lütfen 2MB\'tan küçük bir fotoğraf seçiniz.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatarUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setAvatarUrl(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newOrUpdatedFriend: Friend = {
      id: initialFriend?.id || 'friend-' + Date.now(),
      name: name.trim(),
      birthDate,
      includeYear,
      avatarUrl,
      avatarColor,
      phone: phone.trim() || undefined,
      notes: notes.trim() || undefined,
      notifications,
      giftIdeas: initialFriend?.giftIdeas || [],
      givenGifts: initialFriend?.givenGifts || [],
      receivedGifts: initialFriend?.receivedGifts || [],
      createdAt: initialFriend?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(newOrUpdatedFriend);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-stone-100 dark:border-stone-800">
          <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
            {initialFriend ? 'Arkadaş Bilgilerini Güncelle' : 'Yeni Arkadaş Ekle'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Avatar and Photo selector */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative group">
              <Avatar
                name={name || 'Yeni'}
                avatarUrl={avatarUrl}
                avatarColor={avatarColor}
                size="xl"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2 rounded-full bg-amber-600 text-white shadow-md hover:bg-amber-700 transition-transform active:scale-95 cursor-pointer"
                title="Fotoğraf Yükle"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer flex items-center gap-1"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Fotoğraf Yükle</span>
              </button>
              {avatarUrl && (
                <>
                  <span className="text-stone-300">•</span>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="text-xs text-rose-500 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Kaldır</span>
                  </button>
                </>
              )}
            </div>

            {/* Preset Colors if no photo */}
            {!avatarUrl && (
              <div className="flex items-center gap-1.5 pt-1">
                {PRESET_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setAvatarColor(color)}
                    style={{ backgroundColor: color }}
                    className={`w-6 h-6 rounded-full transition-all cursor-pointer ${
                      avatarColor === color ? 'ring-2 ring-stone-900 dark:ring-white scale-110' : 'opacity-80 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Name Field */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Arkadaşının Adı Soyadı *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Örn: Ayşe Yılmaz"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500/40"
            />
          </div>

          {/* Birth Date Field */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-600" />
                <span>Doğum Tarihi *</span>
              </label>
              <label className="flex items-center gap-1 text-xs text-stone-500 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeYear}
                  onChange={e => setIncludeYear(e.target.checked)}
                  className="rounded-sm accent-amber-600"
                />
                <span>Doğum yılını dahil et</span>
              </label>
            </div>
            <input
              type="date"
              required
              value={birthDate}
              onChange={e => setBirthDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500/40"
            />
          </div>

          {/* Phone / Contact */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Telefon / İletişim (İsteğe bağlı)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+90 5XX XXX XX XX"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500/40"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Kişisel Notlar & İlgi Alanları
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              placeholder="Örn: Kahve, mimarlık ve kurgu romanları seviyor..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500/40"
            />
          </div>

          {/* Notifications Quick Configuration */}
          <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-stone-800/60 border border-amber-200/80 dark:border-stone-700 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900 dark:text-stone-100">
                <Bell className="w-3.5 h-3.5 text-amber-600" />
                <span>Bildirim Tercihleri</span>
              </div>
              <label className="flex items-center gap-1 text-xs font-semibold text-amber-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.enabled}
                  onChange={e => setNotifications(prev => ({ ...prev, enabled: e.target.checked }))}
                  className="rounded-sm accent-amber-600"
                />
                <span>Etkin</span>
              </label>
            </div>

            {notifications.enabled && (
              <div className="grid grid-cols-2 gap-2 text-xs text-stone-700 dark:text-stone-300 pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.onDay}
                    onChange={e => setNotifications(prev => ({ ...prev, onDay: e.target.checked }))}
                    className="rounded-sm accent-amber-600"
                  />
                  <span>Gününde (09:00)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.oneDayBefore}
                    onChange={e => setNotifications(prev => ({ ...prev, oneDayBefore: e.target.checked }))}
                    className="rounded-sm accent-amber-600"
                  />
                  <span>1 gün önce</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.threeDaysBefore}
                    onChange={e => setNotifications(prev => ({ ...prev, threeDaysBefore: e.target.checked }))}
                    className="rounded-sm accent-amber-600"
                  />
                  <span>3 gün önce</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.oneWeekBefore}
                    onChange={e => setNotifications(prev => ({ ...prev, oneWeekBefore: e.target.checked }))}
                    className="rounded-sm accent-amber-600"
                  />
                  <span>1 hafta önce</span>
                </label>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100 dark:border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-stone-600 dark:text-stone-300 text-xs font-semibold hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 text-white text-xs font-bold shadow-md shadow-amber-600/20 hover:from-amber-700 hover:to-rose-700 transition-all cursor-pointer active:scale-95"
            >
              {initialFriend ? 'Değişiklikleri Kaydet' : 'Arkadaşı Ekle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
