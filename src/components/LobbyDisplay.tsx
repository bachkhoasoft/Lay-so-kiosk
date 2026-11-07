import React, { useState, useEffect } from 'react';
import { useQueue } from '../hooks/useQueue';
import { soundService } from '../services/soundService';
import { useLanguage } from '../i18n/LanguageContext';
import {
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Users,
  Clock,
  Sparkles,
  ArrowRight,
  BellRing,
  Building,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export function LobbyDisplay() {
  const { counters, tickets, lastCall, config, updateConfig } = useQueue();
  const { lang, t, formatString } = useLanguage();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Flash spotlight when a new call announcement arrives
  useEffect(() => {
    if (lastCall) {
      setIsBlinking(true);
      const timer = setTimeout(() => setIsBlinking(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [lastCall]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const timeString = currentTime.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const dateString = currentTime.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  // Calculate active latest ticket details
  const activeSpotlightTicket = lastCall
    ? tickets.find((t) => t.ticketNumber === lastCall.ticketNumber) || null
    : null;

  // Recent calls (last 4 called tickets)
  const recentCalls = tickets
    .filter((t) => t.status === 'calling' || t.status === 'serving')
    .sort((a, b) => (b.calledAt || 0) - (a.calledAt || 0))
    .slice(0, 4);

  const waitingTotal = tickets.filter((t) => t.status === 'waiting').length;
  const completedTotal = tickets.filter((t) => t.status === 'completed').length;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans select-none">
      {/* TOP ADMINISTRATIVE HEADER */}
      <header className="bg-gradient-to-r from-red-900 via-red-800 to-amber-900 border-b-4 border-amber-400 px-6 py-3.5 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-400 border-2 border-amber-200 flex items-center justify-center text-red-900 shadow-md">
            <span className="text-xl font-black">★</span>
          </div>
          <div>
            <div className="text-[11px] font-bold tracking-widest text-amber-300 uppercase">
              {t.countryName} • {t.motto}
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase drop-shadow-xs">
              {lang === 'vi' ? config.centerName : t.centerName}
            </h1>
          </div>
        </div>

        {/* Clock & Controls */}
        <div className="flex items-center gap-5">
          <div className="hidden lg:flex items-center gap-4 px-4 py-1.5 rounded-xl bg-black/30 border border-white/10 text-xs">
            <div>
              <span className="text-slate-400">{t.statsWaiting}: </span>
              <span className="font-bold text-amber-400 text-sm">{waitingTotal}</span>
            </div>
            <div className="w-px h-4 bg-white/20"></div>
            <div>
              <span className="text-slate-400">{t.statsDone}: </span>
              <span className="font-bold text-emerald-400 text-sm">{completedTotal}</span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl sm:text-3xl font-black font-mono tracking-wider text-amber-300 drop-shadow-xs">
              {timeString}
            </div>
            <div className="text-xs text-slate-200 capitalize font-medium">
              {dateString}
            </div>
          </div>

          <div className="flex items-center gap-1.5 pl-2 border-l border-white/20">
            <button
              onClick={() => updateConfig({ soundEnabled: !config.soundEnabled })}
              title={config.soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              {config.soundEnabled ? <Volume2 className="w-5 h-5 text-amber-300" /> : <VolumeX className="w-5 h-5 text-red-300" />}
            </button>
            <button
              onClick={toggleFullscreen}
              title="Toàn màn hình"
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* MAIN SCREEN AREA */}
      <main className="flex-1 p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* LEFT COLUMN: ACTIVE SPOTLIGHT TICKET (40% width on large screens) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div
            className={`flex-1 rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden transition-all duration-300 border-4 shadow-2xl ${
              isBlinking
                ? 'bg-gradient-to-b from-red-950 via-slate-900 to-amber-950 border-amber-400 shadow-amber-500/30 ring-8 ring-amber-400/20'
                : 'bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-slate-700 shadow-black'
            }`}
          >
            {/* Background Glow Circles */}
            <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-red-600/10 blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"></div>

            {/* Top Spotlight Header */}
            <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <span className={`w-3.5 h-3.5 rounded-full ${isBlinking ? 'bg-amber-400 animate-ping' : 'bg-emerald-500'}`}></span>
                <span className="text-xs sm:text-sm font-black tracking-widest uppercase text-amber-400">
                  {isBlinking ? t.callingNow : t.callingTitle}
                </span>
              </div>
              {lastCall && (
                <div className="px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-[11px] font-bold text-red-300">
                  {lastCall.type === 'recall' ? 'GỌI LẠI LẦN 2' : 'VỪA GỌI'}
                </div>
              )}
            </div>

            {/* Center: BIG TICKET NUMBER */}
            <div className="relative z-10 my-auto text-center py-6">
              {lastCall ? (
                <>
                  <div className="text-xs uppercase tracking-widest text-slate-400 mb-2 font-medium">
                    {t.inviteCitizen}
                  </div>
                  <div
                    className={`font-mono font-black tracking-tight text-7xl sm:text-8xl md:text-9xl text-amber-400 drop-shadow-lg ${
                      isBlinking ? 'scale-105 transition-transform animate-pulse' : ''
                    }`}
                  >
                    {lastCall.ticketNumber}
                  </div>

                  {activeSpotlightTicket?.citizenName && (
                    <div className="mt-3 text-lg sm:text-xl font-bold text-white tracking-wide">
                      {t.labelFullName}: <span className="text-amber-200">{activeSpotlightTicket.citizenName}</span>
                    </div>
                  )}

                  {/* Destination Counter Badge */}
                  <div className="mt-6 inline-flex flex-col sm:flex-row items-center gap-3 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-red-700 to-amber-600 text-white shadow-xl shadow-red-950/50 border border-amber-300/40">
                    <span className="text-xs uppercase tracking-wider text-amber-200 font-semibold">{t.pleaseGoTo}</span>
                    <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                      {lastCall.counterName}
                    </span>
                  </div>

                  <div className="mt-4 text-xs sm:text-sm text-slate-300 font-medium">
                    {t.serviceField} <span className="text-white font-bold">{lastCall.serviceName}</span>
                  </div>
                </>
              ) : (
                <div className="py-12 text-slate-500 flex flex-col items-center">
                  <BellRing className="w-16 h-16 text-slate-600 mb-3 animate-bounce" />
                  <div className="text-xl font-bold text-slate-400">{t.noActiveCall}</div>
                  <div className="text-xs text-slate-500 mt-1">{t.prepMessage}</div>
                </div>
              )}
            </div>

            {/* Recent Calls Mini Bar */}
            <div className="relative z-10 border-t border-white/10 pt-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                {t.recentCalls}
              </div>
              <div className="grid grid-cols-4 gap-2">
                {recentCalls.map((item) => (
                  <div
                    key={item.id}
                    className="p-2 rounded-xl bg-white/5 border border-white/10 text-center hover:bg-white/10 transition-colors"
                  >
                    <div className="font-mono font-bold text-sm text-amber-300">
                      {item.ticketNumber}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {item.counterName || `Quầy ${item.counterId}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ALL 8 COUNTERS GRID (70% width on large screens) */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Building className="w-4 h-4 text-amber-400" />
              {t.counterStatusTitle}
            </h2>
            <div className="text-xs text-slate-400">
              {formatString(t.totalCountersCount, { count: counters.length })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 flex-1">
            {counters.map((counter) => {
              const currentTicket = tickets.find((t) => t.id === counter.currentTicketId);
              const isCallingThis = currentTicket?.status === 'calling';
              const isServing = currentTicket?.status === 'serving';

              const waitingForThis = tickets.filter((t) => {
                if (t.status !== 'waiting') return false;
                if (t.isPriority && counter.assignedServices.includes('priority')) return true;
                return counter.assignedServices.includes(t.serviceId);
              }).length;

              return (
                <div
                  key={counter.id}
                  className={`rounded-2xl p-4 flex flex-col justify-between border-2 transition-all ${
                    isCallingThis
                      ? 'bg-gradient-to-br from-red-950/80 to-slate-900 border-amber-400 ring-2 ring-amber-400/30'
                      : isServing
                      ? 'bg-slate-900 border-emerald-500/60'
                      : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  {/* Counter Top Row */}
                  <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-xl bg-red-600/20 border border-red-500/40 text-red-300 font-black text-xs flex items-center justify-center font-mono">
                        {counter.id < 10 ? `0${counter.id}` : counter.id}
                      </span>
                      <div>
                        <h3 className="font-extrabold text-base text-white tracking-tight">
                          {counter.name}
                        </h3>
                        <p className="text-[11px] text-slate-400 truncate max-w-[150px]">
                          {counter.officerName}
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {isCallingThis ? (
                        <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black uppercase tracking-wider animate-pulse">
                          {t.statusCalling}
                        </span>
                      ) : isServing ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                          {t.statusServing}
                        </span>
                      ) : counter.status === 'break' ? (
                        <span className="px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 text-[10px] font-medium">
                          {t.statusBreak}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-medium">
                          {t.statusReady}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Serving Ticket Display */}
                  <div className="my-3 text-center py-2 bg-black/40 rounded-xl border border-white/5">
                    <span className="text-[10px] uppercase text-slate-400 tracking-wider">
                      {t.servingTicketLabel}
                    </span>
                    <div
                      className={`text-4xl font-black font-mono tracking-wider mt-0.5 ${
                        currentTicket
                          ? isCallingThis
                            ? 'text-amber-400 animate-pulse'
                            : 'text-emerald-400'
                          : 'text-slate-600'
                      }`}
                    >
                      {currentTicket ? currentTicket.ticketNumber : '---'}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 truncate px-2">
                      {currentTicket ? currentTicket.serviceName : 'Chưa có hồ sơ'}
                    </div>
                  </div>

                  {/* Counter Bottom Info */}
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/5">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-amber-400" />
                      {t.waitingAtCounter} <strong className="text-white">{waitingForThis}</strong>
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {t.servedToday} <strong className="text-slate-200">{counter.servingCountToday}</strong>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* BOTTOM MARQUEE NEWS TICKER */}
      <footer className="bg-red-950 border-t-2 border-amber-500 text-white py-2.5 px-4 overflow-hidden relative">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-amber-400 text-red-950 px-3 py-1 rounded-md text-xs font-black uppercase tracking-wider shrink-0 shadow-sm">
            <span>{t.tickerNotice}</span>
          </div>

          <div className="overflow-hidden whitespace-nowrap flex-1">
            <div className="animate-marquee inline-block text-xs sm:text-sm font-medium text-amber-100 space-x-12">
              <span>
                ★ Kính đề nghị Quý công dân xuất trình thẻ Căn cước công dân gắn chip hoặc ứng dụng VNeID mức độ 2 khi đến làm việc tại các quầy.
              </span>
              <span>
                ★ Người cao tuổi (từ 75 tuổi), Phụ nữ mang thai, Người khuyết tật và Người có công được phục vụ tại luồng Ưu Tiên (Dòng P).
              </span>
              <span>
                ★ Thời gian làm việc: Buổi sáng từ 07:30 đến 11:30 | Buổi chiều từ 13:30 đến 17:00 (từ Thứ Hai đến Thứ Sáu).
              </span>
              <span>
                ★ Đường dây nóng tiếp nhận phản ánh, kiến nghị về thủ tục hành chính: 1900 6868 hoặc liên hệ Bàn Hướng dẫn tại sảnh trung tâm.
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
