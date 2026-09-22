import React, { useState } from 'react';
import { Friend, GiftIdea, GiftHistoryItem, Priority } from '../types';
import { Avatar } from './Avatar';
import {
  formatBirthdayTurkish,
  getZodiacSign,
  parseBirthDate,
  getNextAge,
  getCurrentAge,
  getUpcomingBirthdayLabel
} from '../utils/birthdayUtils';
import { sendTestNotification } from '../utils/notifications';
import {
  X,
  Edit2,
  Trash2,
  Gift,
  Bell,
  History,
  Calendar,
  Plus,
  CheckCircle2,
  Circle,
  ExternalLink,
  DollarSign,
  Send,
  MessageSquare,
  Sparkles,
  ArrowRightLeft
} from 'lucide-react';

interface FriendDetailModalProps {
  friend: Friend;
  onClose: () => void;
  onUpdateFriend: (updated: Friend) => void;
  onDeleteFriend: (friendId: string) => void;
  onOpenEditForm: (friend: Friend) => void;
}

export const FriendDetailModal: React.FC<FriendDetailModalProps> = ({
  friend,
  onClose,
  onUpdateFriend,
  onDeleteFriend,
  onOpenEditForm
}) => {
  const [activeTab, setActiveTab] = useState<'wishlist' | 'given' | 'received' | 'notifications'>('wishlist');

  // Gift Idea Form State
  const [isAddingGiftIdea, setIsAddingGiftIdea] = useState(false);
  const [editingGiftIdeaId, setEditingGiftIdeaId] = useState<string | null>(null);
  const [giftTitle, setGiftTitle] = useState('');
  const [giftPrice, setGiftPrice] = useState<string>('');
  const [giftPriority, setGiftPriority] = useState<Priority>('medium');
  const [giftNotes, setGiftNotes] = useState('');
  const [giftUrl, setGiftUrl] = useState('');

  // Past Gift Given Form State
  const [isAddingGivenGift, setIsAddingGivenGift] = useState(false);
  const [editingGivenId, setEditingGivenId] = useState<string | null>(null);
  const [givenYear, setGivenYear] = useState<number>(new Date().getFullYear() - 1);
  const [givenTitle, setGivenTitle] = useState('');
  const [givenPrice, setGivenPrice] = useState<string>('');
  const [givenNotes, setGivenNotes] = useState('');

  // Past Gift Received Form State
  const [isAddingReceivedGift, setIsAddingReceivedGift] = useState(false);
  const [editingReceivedId, setEditingReceivedId] = useState<string | null>(null);
  const [receivedYear, setReceivedYear] = useState<number>(new Date().getFullYear() - 1);
  const [receivedTitle, setReceivedTitle] = useState('');
  const [receivedNotes, setReceivedNotes] = useState('');

  // Notification status feedback
  const [notificationFeedback, setNotificationFeedback] = useState<string | null>(null);

  const { month, day } = parseBirthDate(friend.birthDate);
  const zodiac = getZodiacSign(month, day);
  const nextAge = getNextAge(friend.birthDate, friend.includeYear);
  const currentAge = getCurrentAge(friend.birthDate, friend.includeYear);
  const countdown = getUpcomingBirthdayLabel(
    Math.round(
      (new Date(new Date().getFullYear(), month - 1, day).getTime() - new Date().setHours(0,0,0,0)) /
      (1000 * 60 * 60 * 24)
    ) >= 0
      ? Math.round((new Date(new Date().getFullYear(), month - 1, day).getTime() - new Date().setHours(0,0,0,0)) / (1000 * 60 * 60 * 24))
      : Math.round((new Date(new Date().getFullYear() + 1, month - 1, day).getTime() - new Date().setHours(0,0,0,0)) / (1000 * 60 * 60 * 24))
  );

  // Wishlist Handlers
  const handleSaveGiftIdea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!giftTitle.trim()) return;

    let updatedGiftIdeas: GiftIdea[] = [...(friend.giftIdeas || [])];
    if (editingGiftIdeaId) {
      updatedGiftIdeas = updatedGiftIdeas.map(item =>
        item.id === editingGiftIdeaId
          ? {
              ...item,
              title: giftTitle.trim(),
              estimatedPrice: giftPrice ? parseFloat(giftPrice) : undefined,
              priority: giftPriority,
              notes: giftNotes.trim() || undefined,
              url: giftUrl.trim() || undefined
            }
          : item
      );
    } else {
      const newIdea: GiftIdea = {
        id: 'gift-' + Date.now(),
        title: giftTitle.trim(),
        estimatedPrice: giftPrice ? parseFloat(giftPrice) : undefined,
        currency: '₺',
        priority: giftPriority,
        notes: giftNotes.trim() || undefined,
        url: giftUrl.trim() || undefined,
        isPurchased: false,
        createdAt: new Date().toISOString()
      };
      updatedGiftIdeas.unshift(newIdea);
    }

    onUpdateFriend({
      ...friend,
      giftIdeas: updatedGiftIdeas,
      updatedAt: new Date().toISOString()
    });

    // Reset Form
    setIsAddingGiftIdea(false);
    setEditingGiftIdeaId(null);
    setGiftTitle('');
    setGiftPrice('');
    setGiftNotes('');
    setGiftUrl('');
  };

  const handleTogglePurchased = (ideaId: string) => {
    const updated = (friend.giftIdeas || []).map(g =>
      g.id === ideaId ? { ...g, isPurchased: !g.isPurchased } : g
    );
    onUpdateFriend({
      ...friend,
      giftIdeas: updated,
      updatedAt: new Date().toISOString()
    });
  };

  const handleDeleteGiftIdea = (ideaId: string) => {
    if (!confirm('Bu hediye fikrini silmek istediğinize emin misiniz?')) return;
    const updated = (friend.giftIdeas || []).filter(g => g.id !== ideaId);
    onUpdateFriend({
      ...friend,
      giftIdeas: updated,
      updatedAt: new Date().toISOString()
    });
  };

  const handleEditGiftIdea = (idea: GiftIdea) => {
    setEditingGiftIdeaId(idea.id);
    setGiftTitle(idea.title);
    setGiftPrice(idea.estimatedPrice ? String(idea.estimatedPrice) : '');
    setGiftPriority(idea.priority);
    setGiftNotes(idea.notes || '');
    setGiftUrl(idea.url || '');
    setIsAddingGiftIdea(true);
  };

  // Given Gifts Handlers ("Ona Aldıklarım")
  const handleSaveGivenGift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!givenTitle.trim()) return;

    let list = [...(friend.givenGifts || [])];
    if (editingGivenId) {
      list = list.map(item =>
        item.id === editingGivenId
          ? {
              ...item,
              year: givenYear,
              title: givenTitle.trim(),
              price: givenPrice ? parseFloat(givenPrice) : undefined,
              notes: givenNotes.trim() || undefined
            }
          : item
      );
    } else {
      list.unshift({
        id: 'given-' + Date.now(),
        year: givenYear,
        title: givenTitle.trim(),
        price: givenPrice ? parseFloat(givenPrice) : undefined,
        notes: givenNotes.trim() || undefined,
        createdAt: new Date().toISOString()
      });
    }

    onUpdateFriend({
      ...friend,
      givenGifts: list,
      updatedAt: new Date().toISOString()
    });

    setIsAddingGivenGift(false);
    setEditingGivenId(null);
    setGivenTitle('');
    setGivenPrice('');
    setGivenNotes('');
  };

  const handleDeleteGivenGift = (id: string) => {
    if (!confirm('Bu geçmiş hediye kaydını silmek istiyor musunuz?')) return;
    const list = (friend.givenGifts || []).filter(item => item.id !== id);
    onUpdateFriend({ ...friend, givenGifts: list });
  };

  // Received Gifts Handlers ("Bana Aldıkları")
  const handleSaveReceivedGift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!receivedTitle.trim()) return;

    let list = [...(friend.receivedGifts || [])];
    if (editingReceivedId) {
      list = list.map(item =>
        item.id === editingReceivedId
          ? {
              ...item,
              year: receivedYear,
              title: receivedTitle.trim(),
              notes: receivedNotes.trim() || undefined
            }
          : item
      );
    } else {
      list.unshift({
        id: 'rec-' + Date.now(),
        year: receivedYear,
        title: receivedTitle.trim(),
        notes: receivedNotes.trim() || undefined,
        createdAt: new Date().toISOString()
      });
    }

    onUpdateFriend({
      ...friend,
      receivedGifts: list,
      updatedAt: new Date().toISOString()
    });

    setIsAddingReceivedGift(false);
    setEditingReceivedId(null);
    setReceivedTitle('');
    setReceivedNotes('');
  };

  const handleDeleteReceivedGift = (id: string) => {
    if (!confirm('Bu hediye kaydını silmek istiyor musunuz?')) return;
    const list = (friend.receivedGifts || []).filter(item => item.id !== id);
    onUpdateFriend({ ...friend, receivedGifts: list });
  };

  // Notification settings updates
  const handleToggleNotificationField = (field: keyof Friend['notifications']) => {
    const current = friend.notifications || {
      enabled: true,
      onDay: true,
      oneDayBefore: true,
      threeDaysBefore: false,
      oneWeekBefore: true,
      time: '09:00'
    };

    const updated = {
      ...current,
      [field]: !current[field]
    };

    onUpdateFriend({
      ...friend,
      notifications: updated as Friend['notifications'],
      updatedAt: new Date().toISOString()
    });
  };

  const handleTestNotification = () => {
    sendTestNotification(friend, 'on_day');
    setNotificationFeedback('✅ Bildirim sesi ve yerel cihaz bildirimi gönderildi!');
    setTimeout(() => setNotificationFeedback(null), 4000);
  };

  const totalEstimatedWishlist = (friend.giftIdeas || []).reduce(
    (acc, curr) => acc + (curr.estimatedPrice || 0),
    0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden my-6">
        {/* Top bar with close */}
        <div className="flex items-center justify-between p-4 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Arkadaş Profili
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onOpenEditForm(friend)}
              className="p-2 rounded-xl text-stone-500 hover:text-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              title="Bilgileri Düzenle"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDeleteFriend(friend.id)}
              className="p-2 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
              title="Arkadaşı Sil"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Profile Header */}
        <div className="p-6 bg-gradient-to-br from-amber-50/70 via-rose-50/40 to-transparent dark:from-stone-800/40 dark:to-stone-900 border-b border-stone-100 dark:border-stone-800">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 text-center sm:text-left">
            <Avatar
              name={friend.name}
              avatarUrl={friend.avatarUrl}
              avatarColor={friend.avatarColor}
              size="xl"
            />
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                  {friend.name}
                </h2>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold self-center sm:self-auto ${countdown.badgeColor}`}>
                  {countdown.text}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1 text-sm text-stone-600 dark:text-stone-300">
                <div className="flex items-center gap-1.5 font-medium">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  <span>{formatBirthdayTurkish(friend.birthDate, friend.includeYear)}</span>
                </div>
                {nextAge && (
                  <span className="text-amber-700 dark:text-amber-400 font-semibold">
                    ({nextAge}. yaşa girecek)
                  </span>
                )}
                <span className="text-stone-500">
                  {zodiac.symbol} {zodiac.name}
                </span>
              </div>

              {friend.notes && (
                <p className="text-xs text-stone-500 dark:text-stone-400 italic pt-1">
                  "{friend.notes}"
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-stone-200 dark:border-stone-800 px-4 bg-stone-50/60 dark:bg-stone-900/60 overflow-x-auto text-xs sm:text-sm">
          <button
            onClick={() => setActiveTab('wishlist')}
            className={`flex items-center gap-1.5 py-3 px-3 font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'wishlist'
                ? 'border-amber-600 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Gift className="w-4 h-4" />
            <span>Hediye Fikirleri ({friend.giftIdeas?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('given')}
            className={`flex items-center gap-1.5 py-3 px-3 font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'given'
                ? 'border-amber-600 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Ona Aldıklarım ({friend.givenGifts?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('received')}
            className={`flex items-center gap-1.5 py-3 px-3 font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'received'
                ? 'border-amber-600 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Bana Aldıkları ({friend.receivedGifts?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center gap-1.5 py-3 px-3 font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'notifications'
                ? 'border-amber-600 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Hatırlatıcı Ayarları</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
          {/* TAB 1: WISHLIST (Hediye Fikirleri) */}
          {activeTab === 'wishlist' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                    Aklındaki Hediye Fikirleri
                  </h3>
                  <p className="text-xs text-stone-500">
                    Toplam tahmini bütçe: {totalEstimatedWishlist} ₺
                  </p>
                </div>
                {!isAddingGiftIdea && (
                  <button
                    onClick={() => {
                      setEditingGiftIdeaId(null);
                      setGiftTitle('');
                      setGiftPrice('');
                      setGiftNotes('');
                      setGiftUrl('');
                      setIsAddingGiftIdea(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Fikir Ekle</span>
                  </button>
                )}
              </div>

              {/* Add / Edit Form */}
              {isAddingGiftIdea && (
                <form
                  onSubmit={handleSaveGiftIdea}
                  className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 space-y-3"
                >
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                    {editingGiftIdeaId ? 'Hediye Fikrini Düzenle' : 'Yeni Hediye Fikri Not Et'}
                  </h4>
                  <div className="space-y-2">
                    <input
                      type="text"
                      required
                      value={giftTitle}
                      onChange={e => setGiftTitle(e.target.value)}
                      placeholder="Hediye Başlığı (örn. Deri Cüzdan, Kitap Seti)"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500/40"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        value={giftPrice}
                        onChange={e => setGiftPrice(e.target.value)}
                        placeholder="Tahmini Fiyat (₺)"
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500/40"
                      />
                      <select
                        value={giftPriority}
                        onChange={e => setGiftPriority(e.target.value as Priority)}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500/40"
                      >
                        <option value="high">Öncelik: Yüksek 🌟</option>
                        <option value="medium">Öncelik: Orta</option>
                        <option value="low">Öncelik: Düşük</option>
                      </select>
                    </div>
                    <input
                      type="url"
                      value={giftUrl}
                      onChange={e => setGiftUrl(e.target.value)}
                      placeholder="Web / Ürün Linki (isteğe bağlı)"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500/40"
                    />
                    <textarea
                      value={giftNotes}
                      onChange={e => setGiftNotes(e.target.value)}
                      rows={2}
                      placeholder="Notlar (renk, beden, satıcı vb.)..."
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500/40"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddingGiftIdea(false)}
                      className="px-3 py-1.5 rounded-xl text-stone-600 text-xs font-semibold hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors cursor-pointer"
                    >
                      İptal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition-colors cursor-pointer shadow-xs"
                    >
                      Kaydet
                    </button>
                  </div>
                </form>
              )}

              {/* Ideas List */}
              {(!friend.giftIdeas || friend.giftIdeas.length === 0) && !isAddingGiftIdea ? (
                <div className="text-center py-8 text-stone-400 text-xs italic">
                  Henüz hediye fikri eklenmedi. Aklına gelen şeyleri yukarıdaki butondan not edebilirsin.
                </div>
              ) : (
                <div className="space-y-2">
                  {friend.giftIdeas?.map(idea => (
                    <div
                      key={idea.id}
                      className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                        idea.isPurchased
                          ? 'bg-stone-50/70 dark:bg-stone-950/40 border-stone-200 dark:border-stone-800 opacity-70'
                          : 'bg-white dark:bg-stone-800 border-stone-200/80 dark:border-stone-700 hover:border-amber-300'
                      }`}
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <button
                          onClick={() => handleTogglePurchased(idea.id)}
                          className="mt-0.5 text-amber-600 cursor-pointer"
                          title={idea.isPurchased ? 'Alındı olarak işaretli' : 'Alındı olarak işaretle'}
                        >
                          {idea.isPurchased ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                          ) : (
                            <Circle className="w-5 h-5 text-stone-400 hover:text-amber-600" />
                          )}
                        </button>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4
                              className={`text-sm font-semibold text-stone-900 dark:text-stone-100 ${
                                idea.isPurchased ? 'line-through text-stone-400' : ''
                              }`}
                            >
                              {idea.title}
                            </h4>
                            {idea.estimatedPrice && (
                              <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-medium">
                                {idea.estimatedPrice} {idea.currency || '₺'}
                              </span>
                            )}
                            {idea.priority === 'high' && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold">
                                Yüksek Öncelik
                              </span>
                            )}
                          </div>

                          {idea.notes && (
                            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                              {idea.notes}
                            </p>
                          )}

                          {idea.url && (
                            <a
                              href={idea.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1"
                            >
                              <span>Ürün Bağlantısı</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleEditGiftIdea(idea)}
                          className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteGiftIdea(idea.id)}
                          className="p-1.5 text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ONA ALDIKLARIM (Geçmiş) */}
          {activeTab === 'given' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                    Önceki Yıllarda Ona Aldıklarım
                  </h3>
                  <p className="text-xs text-stone-500">
                    Aynı hediyeyi tekrar almamak ve hediye hafızasını tutmak için
                  </p>
                </div>
                {!isAddingGivenGift && (
                  <button
                    onClick={() => {
                      setEditingGivenId(null);
                      setGivenTitle('');
                      setGivenPrice('');
                      setGivenNotes('');
                      setIsAddingGivenGift(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Kayıt Ekle</span>
                  </button>
                )}
              </div>

              {isAddingGivenGift && (
                <form
                  onSubmit={handleSaveGivenGift}
                  className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 space-y-3"
                >
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                    {editingGivenId ? 'Geçmiş Hediyeyi Düzenle' : 'Ona Aldığın Yeni Bir Hediye Kaydet'}
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="number"
                      required
                      value={givenYear}
                      onChange={e => setGivenYear(parseInt(e.target.value, 10))}
                      placeholder="Yıl (örn. 2025)"
                      className="px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-sm focus:outline-hidden"
                    />
                    <input
                      type="text"
                      required
                      value={givenTitle}
                      onChange={e => setGivenTitle(e.target.value)}
                      placeholder="Hediye Adı"
                      className="col-span-2 px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-sm focus:outline-hidden"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={givenPrice}
                      onChange={e => setGivenPrice(e.target.value)}
                      placeholder="Fiyat (İsteğe bağlı ₺)"
                      className="px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-sm focus:outline-hidden"
                    />
                    <input
                      type="text"
                      value={givenNotes}
                      onChange={e => setGivenNotes(e.target.value)}
                      placeholder="Anı veya Not (örn. Çok sevdi)"
                      className="px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-sm focus:outline-hidden"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddingGivenGift(false)}
                      className="px-3 py-1.5 rounded-xl text-stone-600 text-xs font-semibold hover:bg-stone-200 transition-colors cursor-pointer"
                    >
                      İptal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition-colors cursor-pointer shadow-xs"
                    >
                      Kaydet
                    </button>
                  </div>
                </form>
              )}

              {(!friend.givenGifts || friend.givenGifts.length === 0) && !isAddingGivenGift ? (
                <div className="text-center py-8 text-stone-400 text-xs italic">
                  Henüz geçmiş hediye kaydı bulunmuyor. Önceki yıllarda aldıklarını buraya ekleyebilirsin.
                </div>
              ) : (
                <div className="space-y-2">
                  {friend.givenGifts?.map(item => (
                    <div
                      key={item.id}
                      className="p-3 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-12 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold text-xs flex items-center justify-center shrink-0">
                          {item.year}
                        </span>
                        <div className="min-w-0">
                          <h4 className="text-sm font-semibold text-stone-900 dark:text-stone-100 truncate">
                            {item.title}
                          </h4>
                          {item.notes && (
                            <p className="text-xs text-stone-500 dark:text-stone-400">
                              {item.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {item.price && (
                          <span className="text-xs font-semibold text-stone-500 mr-2">
                            {item.price} ₺
                          </span>
                        )}
                        <button
                          onClick={() => {
                            setEditingGivenId(item.id);
                            setGivenYear(item.year);
                            setGivenTitle(item.title);
                            setGivenPrice(item.price ? String(item.price) : '');
                            setGivenNotes(item.notes || '');
                            setIsAddingGivenGift(true);
                          }}
                          className="p-1.5 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteGivenGift(item.id)}
                          className="p-1.5 text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: BANA ALDIKLARI (Geçmiş) */}
          {activeTab === 'received' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                    Önceki Yıllarda Bana Aldıkları
                  </h3>
                  <p className="text-xs text-stone-500">
                    Benim doğum günlerimde onun getirdiği güzel hediyeler
                  </p>
                </div>
                {!isAddingReceivedGift && (
                  <button
                    onClick={() => {
                      setEditingReceivedId(null);
                      setReceivedTitle('');
                      setReceivedNotes('');
                      setIsAddingReceivedGift(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Kayıt Ekle</span>
                  </button>
                )}
              </div>

              {isAddingReceivedGift && (
                <form
                  onSubmit={handleSaveReceivedGift}
                  className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 space-y-3"
                >
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                    {editingReceivedId ? 'Hediyeyi Düzenle' : 'Bana Aldığı Yeni Bir Hediye Kaydet'}
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="number"
                      required
                      value={receivedYear}
                      onChange={e => setReceivedYear(parseInt(e.target.value, 10))}
                      placeholder="Yıl (örn. 2025)"
                      className="px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-sm focus:outline-hidden"
                    />
                    <input
                      type="text"
                      required
                      value={receivedTitle}
                      onChange={e => setReceivedTitle(e.target.value)}
                      placeholder="Hediye Adı"
                      className="col-span-2 px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-sm focus:outline-hidden"
                    />
                  </div>
                  <input
                    type="text"
                    value={receivedNotes}
                    onChange={e => setReceivedNotes(e.target.value)}
                    placeholder="Anı veya Not (örn. Çok duygulanmıştım)"
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-sm focus:outline-hidden"
                  />
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddingReceivedGift(false)}
                      className="px-3 py-1.5 rounded-xl text-stone-600 text-xs font-semibold hover:bg-stone-200 transition-colors cursor-pointer"
                    >
                      İptal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition-colors cursor-pointer shadow-xs"
                    >
                      Kaydet
                    </button>
                  </div>
                </form>
              )}

              {(!friend.receivedGifts || friend.receivedGifts.length === 0) && !isAddingReceivedGift ? (
                <div className="text-center py-8 text-stone-400 text-xs italic">
                  Henüz bir hediye kaydedilmedi. Bu arkadaşının sana getirdiği hediyeleri ekleyebilirsin.
                </div>
              ) : (
                <div className="space-y-2">
                  {friend.receivedGifts?.map(item => (
                    <div
                      key={item.id}
                      className="p-3 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-12 h-10 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 font-bold text-xs flex items-center justify-center shrink-0">
                          {item.year}
                        </span>
                        <div className="min-w-0">
                          <h4 className="text-sm font-semibold text-stone-900 dark:text-stone-100 truncate">
                            {item.title}
                          </h4>
                          {item.notes && (
                            <p className="text-xs text-stone-500 dark:text-stone-400">
                              {item.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => {
                            setEditingReceivedId(item.id);
                            setReceivedYear(item.year);
                            setReceivedTitle(item.title);
                            setReceivedNotes(item.notes || '');
                            setIsAddingReceivedGift(true);
                          }}
                          className="p-1.5 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteReceivedGift(item.id)}
                          className="p-1.5 text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: HATIRLATICI & BİLDİRİM AYARLARI */}
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  {friend.name} İçin Bildirim Tercihleri
                </h3>
                <p className="text-xs text-stone-500">
                  Hangi zaman dilimlerinde yerel cihaz bildirimi almak istediğinizi seçin.
                </p>
              </div>

              {/* Master toggle */}
              <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-stone-800/80 border border-amber-200 dark:border-stone-700 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                    Bildirimleri Etkinleştir
                  </h4>
                  <p className="text-xs text-stone-500">
                    Bu arkadaşın doğum günü hatırlatıcılarını aç veya kapat
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={friend.notifications?.enabled ?? true}
                  onChange={() => handleToggleNotificationField('enabled')}
                  className="w-5 h-5 accent-amber-600 cursor-pointer"
                />
              </div>

              {/* Individual notification slots */}
              <div className="space-y-2 pt-1">
                <label className="p-3 rounded-xl border border-stone-200 dark:border-stone-700 flex items-center justify-between hover:bg-stone-50 dark:hover:bg-stone-800/40 cursor-pointer transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center text-xs font-bold">
                      🎉
                    </span>
                    <div>
                      <div className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                        Tam gününde saat {friend.notifications?.time || '09:00'}'da
                      </div>
                      <div className="text-xs text-stone-500">Doğum günü sabahı doğrudan tebrik için</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    disabled={!friend.notifications?.enabled}
                    checked={friend.notifications?.onDay ?? true}
                    onChange={() => handleToggleNotificationField('onDay')}
                    className="w-4 h-4 accent-amber-600 cursor-pointer"
                  />
                </label>

                <label className="p-3 rounded-xl border border-stone-200 dark:border-stone-700 flex items-center justify-between hover:bg-stone-50 dark:hover:bg-stone-800/40 cursor-pointer transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center text-xs font-bold">
                      🎈
                    </span>
                    <div>
                      <div className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                        1 gün önce
                      </div>
                      <div className="text-xs text-stone-500">Son hazırlıkları ve hediyeyi kontrol etmek için</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    disabled={!friend.notifications?.enabled}
                    checked={friend.notifications?.oneDayBefore ?? true}
                    onChange={() => handleToggleNotificationField('oneDayBefore')}
                    className="w-4 h-4 accent-amber-600 cursor-pointer"
                  />
                </label>

                <label className="p-3 rounded-xl border border-stone-200 dark:border-stone-700 flex items-center justify-between hover:bg-stone-50 dark:hover:bg-stone-800/40 cursor-pointer transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center text-xs font-bold">
                      🎁
                    </span>
                    <div>
                      <div className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                        3 gün önce
                      </div>
                      <div className="text-xs text-stone-500">Hediye siparişinin kargosu ve planlama için</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    disabled={!friend.notifications?.enabled}
                    checked={friend.notifications?.threeDaysBefore ?? false}
                    onChange={() => handleToggleNotificationField('threeDaysBefore')}
                    className="w-4 h-4 accent-amber-600 cursor-pointer"
                  />
                </label>

                <label className="p-3 rounded-xl border border-stone-200 dark:border-stone-700 flex items-center justify-between hover:bg-stone-50 dark:hover:bg-stone-800/40 cursor-pointer transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center text-xs font-bold">
                      📅
                    </span>
                    <div>
                      <div className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                        1 hafta önce
                      </div>
                      <div className="text-xs text-stone-500">Erken hediye fikri düşünmek ve bütçe ayırmak için</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    disabled={!friend.notifications?.enabled}
                    checked={friend.notifications?.oneWeekBefore ?? true}
                    onChange={() => handleToggleNotificationField('oneWeekBefore')}
                    className="w-4 h-4 accent-amber-600 cursor-pointer"
                  />
                </label>
              </div>

              {/* Instant Test Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleTestNotification}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Bell className="w-4 h-4" />
                  <span>Şimdi Test Bildirimi Gönder (Ses & Push)</span>
                </button>
                {notificationFeedback && (
                  <p className="text-xs text-emerald-600 font-semibold text-center mt-2 animate-fade-in">
                    {notificationFeedback}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
