import React, { useState, useEffect } from 'react';
import { useQueue } from '../hooks/useQueue';
import { soundService } from '../services/soundService';
import { useLanguage } from '../i18n/LanguageContext';
import {
  Monitor,
  Tv,
  UserCheck,
  Smartphone,
  BarChart3,
  Settings,
  Volume2,
  Clock,
  Languages,
  Sparkles
} from 'lucide-react';

export type AppMode = 'kiosk' | 'lobby' | 'officer' | 'mobile' | 'analytics';

interface HeaderProps {
  currentMode: AppMode;
  onSelectMode: (mode: AppMode) => void;
  onOpenSettings: () => void;
}

export function Header({ currentMode, onSelectMode, onOpenSettings }: HeaderProps) {
  const { config, tickets } = useQueue();
  const { lang, setLang, toggleLang, t } = useLanguage();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const waitingCount = tickets.filter((t) => t.status === 'waiting').length;

  const timeStr = time.toLocaleTimeString(lang === 'vi' ? 'vi-VN' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const dateStr = time.toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const navItems = [
    {
      id: 'kiosk' as AppMode,
      label: t.kioskTab,
      icon: Monitor,
    },
    {
      id: 'lobby' as AppMode,
      label: t.lobbyTab,
      icon: Tv,
    },
    {
      id: 'officer' as AppMode,
      label: t.officerTab,
      icon: UserCheck,
      badge: waitingCount > 0 ? waitingCount : undefined,
    },
    {
      id: 'mobile' as AppMode,
      label: t.mobileTab,
      icon: Smartphone,
    },
    {
      id: 'analytics' as AppMode,
      label: t.analyticsTab,
      icon: BarChart3,
    },
  ];

  return (
    <header className="bg-gradient-to-r from-red-800 via-red-900 to-slate-900 text-white shadow-md border-b-2 border-amber-400 select-none">
      {/* Top Administrative Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-amber-400 border border-amber-200 flex items-center justify-center text-red-900 shadow-xs font-black text-sm">
            ★
          </div>
          <div>
            <div className="text-[10px] font-bold tracking-widest text-amber-300 uppercase">
              {t.countryName}
            </div>
            <h1 className="text-sm sm:text-base font-black tracking-tight text-white uppercase">
              {lang === 'vi' ? config.centerName : t.centerName}
            </h1>
          </div>
        </div>

        {/* Right Info: Clock, Audio Test, Language Switcher, Settings */}
        <div className="flex items-center gap-2.5 text-xs">
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 text-slate-200 font-mono font-medium">
            <Clock className="w-3.5 h-3.5 text-amber-300" />
            <span className="text-amber-300 font-bold">{timeStr}</span>
            <span className="text-slate-400">|</span>
            <span className="capitalize">{dateStr}</span>
          </div>

          {/* Language Switcher Button */}
          <div className="flex items-center bg-black/30 rounded-xl p-0.5 border border-white/15">
            <button
              onClick={() => setLang('vi')}
              title="Chuyển sang Tiếng Việt"
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                lang === 'vi'
                  ? 'bg-red-700 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>🇻🇳</span>
              <span>Tiếng Việt</span>
            </button>
            <button
              onClick={() => setLang('en')}
              title="Switch to English"
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                lang === 'en'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>🇬🇧</span>
              <span>English</span>
            </button>
          </div>

          <button
            onClick={() => soundService.testVoice()}
            title="Thử loa phát thanh chuông & giọng đọc"
            className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/30 flex items-center gap-1.5 font-bold transition-colors cursor-pointer"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.testVoice}</span>
          </button>

          <button
            onClick={onOpenSettings}
            title={t.settings}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mode Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-2 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentMode === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectMode(item.id)}
                className={`py-2 px-3 sm:px-4 rounded-xl flex items-center gap-2 text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-amber-400 text-slate-900 shadow-md font-black ring-2 ring-amber-300'
                    : 'text-slate-200 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-900' : 'text-amber-300'}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                      isActive ? 'bg-red-700 text-white' : 'bg-red-500 text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

