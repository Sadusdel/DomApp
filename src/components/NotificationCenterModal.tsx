import React, { useState, useEffect } from 'react';
import { Friend, AppNotificationLog } from '../types';
import {
  requestNotificationPermission,
  getNotificationPermissionStatus,
  sendTestNotification
} from '../utils/notifications';
import {
  loadNotificationsFromStorage,
  saveNotificationsToStorage
} from '../utils/storage';
import {
  X,
  Bell,
  CheckCircle2,
  AlertCircle,
  Volume2,
  Trash2,
  Clock,
  Sparkles
} from 'lucide-react';

interface NotificationCenterModalProps {
  friends: Friend[];
  onClose: () => void;
  onClearUnread: () => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  friends,
  onClose,
  onClearUnread
}) => {
  const [permission, setPermission] = useState<NotificationPermission>(getNotificationPermissionStatus());
  const [logs, setLogs] = useState<AppNotificationLog[]>([]);

  useEffect(() => {
    const stored = loadNotificationsFromStorage();
    setLogs(stored);
    onClearUnread();
  }, [onClearUnread]);

  const handleRequestPermission = async () => {
    const res = await requestNotificationPermission();
    setPermission(res);
  };

  const handleSendQuickTest = () => {
    if (friends.length === 0) return;
    const testLog = sendTestNotification(friends[0], 'test');
    setLogs(prev => [testLog, ...prev]);
  };

  const handleClearHistory = () => {
    saveNotificationsToStorage([]);
    setLogs([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Bildirim & Hatırlatıcı Merkezi
              </h3>
              <p className="text-xs text-stone-500">
                Yerel bildirim servis durumu ve geçmişi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Permission Status Card */}
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Cihaz Bildirim İzni Durumu
              </span>
              {permission === 'granted' ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Aktif & İzin Verildi</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>İzin Bekleniyor</span>
                </span>
              )}
            </div>

            <p className="text-xs text-stone-600 dark:text-stone-300">
              {permission === 'granted'
                ? 'Uygulama arka planda veya açıkken planlanan zamanlarda cihazınıza anlık sesli bildirim gönderir.'
                : 'Doğum günü gününde, 1 gün veya 1 hafta önce yerel push bildirim alabilmek için tarayıcınızdan bildirim izni vermeniz önerilir.'}
            </p>

            <div className="flex items-center gap-2 pt-1">
              {permission !== 'granted' && (
                <button
                  onClick={handleRequestPermission}
                  className="px-3 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition-colors cursor-pointer shadow-xs"
                >
                  Cihaz Bildirim İznini Aç
                </button>
              )}
              <button
                onClick={handleSendQuickTest}
                className="px-3 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-xs font-semibold hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Volume2 className="w-3.5 h-3.5 text-amber-600" />
                <span>Test Bildirimi Çal</span>
              </button>
            </div>
          </div>

          {/* Active Rules Info */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Desteklenen Hatırlatma Aralıkları
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-amber-50/60 dark:bg-stone-800 border border-amber-200/60 dark:border-stone-700 flex items-center gap-2">
                <span className="text-base">🎉</span>
                <div>
                  <span className="font-semibold block text-stone-800 dark:text-stone-200">Tam Gününde</span>
                  <span className="text-[11px] text-stone-500">Saat 09:00'da</span>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50/60 dark:bg-stone-800 border border-amber-200/60 dark:border-stone-700 flex items-center gap-2">
                <span className="text-base">🎈</span>
                <div>
                  <span className="font-semibold block text-stone-800 dark:text-stone-200">1 Gün Önce</span>
                  <span className="text-[11px] text-stone-500">Son hatırlatma</span>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50/60 dark:bg-stone-800 border border-amber-200/60 dark:border-stone-700 flex items-center gap-2">
                <span className="text-base">🎁</span>
                <div>
                  <span className="font-semibold block text-stone-800 dark:text-stone-200">3 Gün Önce</span>
                  <span className="text-[11px] text-stone-500">Kargo & sipariş</span>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50/60 dark:bg-stone-800 border border-amber-200/60 dark:border-stone-700 flex items-center gap-2">
                <span className="text-base">📅</span>
                <div>
                  <span className="font-semibold block text-stone-800 dark:text-stone-200">1 Hafta Önce</span>
                  <span className="text-[11px] text-stone-500">Fikir düşünme</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notification History Log */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Bildirim Geçmişi ({logs.length})
              </h4>
              {logs.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="text-xs text-rose-500 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Temizle</span>
                </button>
              )}
            </div>

            {logs.length === 0 ? (
              <div className="text-center py-6 text-xs text-stone-400 italic">
                Henüz kaydedilmiş bir bildirim uyarısı bulunmuyor.
              </div>
            ) : (
              <div className="space-y-2">
                {logs.map(log => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-900 dark:text-stone-100">
                        {log.title}
                      </span>
                      <span className="text-[10px] text-stone-400">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-stone-600 dark:text-stone-300">
                      {log.body}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
