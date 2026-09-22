import React, { useRef } from 'react';
import { Friend } from '../types';
import { exportBackupJSON, resetToDefaults, saveFriendsToStorage } from '../utils/storage';
import {
  X,
  Download,
  Upload,
  RefreshCw,
  HardDrive,
  ShieldCheck,
  Trash2,
  WifiOff
} from 'lucide-react';

interface SettingsModalProps {
  friends: Friend[];
  onUpdateAllFriends: (friends: Friend[]) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  friends,
  onUpdateAllFriends,
  onClose
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    exportBackupJSON(friends);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        const importedFriends = Array.isArray(parsed) ? parsed : parsed.friends;
        if (Array.isArray(importedFriends)) {
          saveFriendsToStorage(importedFriends);
          onUpdateAllFriends(importedFriends);
          alert('Yedek başarıyla geri yüklendi!');
          onClose();
        } else {
          alert('Geçersiz dosya formatı.');
        }
      } catch {
        alert('Dosya okunurken bir hata oluştu.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetSampleData = () => {
    if (confirm('Tüm mevcut veriler silinecek ve başlangıç örnek arkadaşları yüklenecektir. Onaylıyor musunuz?')) {
      const sample = resetToDefaults();
      onUpdateAllFriends(sample);
      onClose();
    }
  };

  const handleClearAll = () => {
    if (confirm('Tüm kayıtlı arkadaşlar ve hediye geçmişi silinecektir. Bu işlem geri alınamaz!')) {
      saveFriendsToStorage([]);
      onUpdateAllFriends([]);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-stone-100 dark:border-stone-800">
          <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
            Ayarlar & Veri Yönetimi
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Offline & Privacy Badge */}
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300">
              <WifiOff className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200 uppercase tracking-wider">
                  %100 Çevrimdışı & Güvenli
                </h4>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <p className="text-xs text-emerald-800 dark:text-emerald-300">
                Tüm arkadaş doğum günleri, fotoğraflar ve hediye geçmişi yalnızca cihazınızın yerel depolama alanında saklanır. İnternet bağlantısı olmadan da eksiksiz çalışır.
              </p>
            </div>
          </div>

          {/* Backup & Restore */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Yedekleme ve Aktarma
            </h4>

            <div className="space-y-2">
              <button
                onClick={handleExport}
                className="w-full p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:border-amber-400 flex items-center justify-between text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600">
                    <Download className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-stone-900 dark:text-stone-100 group-hover:text-amber-600 transition-colors">
                      Verileri Yedekle (JSON İndir)
                    </h5>
                    <p className="text-xs text-stone-500">
                      Tüm arkadaş ve hediye kayıtlarını cihazına dosya olarak kaydet
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:border-amber-400 flex items-center justify-between text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-stone-900 dark:text-stone-100 group-hover:text-blue-600 transition-colors">
                      Yedekten Geri Yükle (JSON Yükle)
                    </h5>
                    <p className="text-xs text-stone-500">
                      Önceden aldığın bir yedek dosyasını uygulamaya aktar
                    </p>
                  </div>
                </div>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImport}
                accept=".json,application/json"
                className="hidden"
              />
            </div>
          </div>

          {/* Reset Actions */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Sıfırlama Seçenekleri
            </h4>

            <div className="space-y-2">
              <button
                onClick={handleResetSampleData}
                className="w-full p-3 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 flex items-center gap-2.5 text-xs font-semibold transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4 text-amber-600" />
                <span>Örnek Başlangıç Verilerini Yeniden Yükle</span>
              </button>

              <button
                onClick={handleClearAll}
                className="w-full p-3 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2.5 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4 text-rose-500" />
                <span>Tüm Verileri Sıfırla ve Temizle</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
