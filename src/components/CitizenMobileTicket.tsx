import React, { useState, useEffect } from 'react';
import { useQueue } from '../hooks/useQueue';
import { useLanguage } from '../i18n/LanguageContext';
import { soundService } from '../services/soundService';
import {
  Smartphone,
  Search,
  CheckCircle2,
  Clock,
  Users,
  MapPin,
  Star,
  ThumbsUp,
  AlertCircle,
  Bell,
  Sparkles,
  ShieldCheck,
  Send,
  Building
} from 'lucide-react';

interface CitizenMobileTicketProps {
  initialTicketId?: string | null;
}

export function CitizenMobileTicket({ initialTicketId }: CitizenMobileTicketProps) {
  const { tickets, counters, rateTicket, config } = useQueue();
  const { lang, t, formatString } = useLanguage();

  const [inputTicketNumber, setInputTicketNumber] = useState('');
  const [activeTicketId, setActiveTicketId] = useState<string | null>(initialTicketId || null);

  // Satisfaction rating form
  const [stars, setStars] = useState<number>(5);
  const [attitudeScore, setAttitudeScore] = useState<boolean>(true);
  const [clarityScore, setClarityScore] = useState<boolean>(true);
  const [speedScore, setSpeedScore] = useState<boolean>(true);
  const [comment, setComment] = useState<string>('');
  const [hasRated, setHasRated] = useState<boolean>(false);

  // If initialTicketId changes
  useEffect(() => {
    if (initialTicketId) {
      setActiveTicketId(initialTicketId);
    }
  }, [initialTicketId]);

  // Find active ticket
  const currentTicket = activeTicketId
    ? tickets.find((t) => t.id === activeTicketId || t.ticketNumber.toUpperCase() === activeTicketId.toUpperCase())
    : tickets.find((t) => t.status === 'waiting' || t.status === 'calling' || t.status === 'serving') || tickets[0];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputTicketNumber.trim()) return;
    const found = tickets.find(
      (t) => t.ticketNumber.toLowerCase() === inputTicketNumber.trim().toLowerCase()
    );
    if (found) {
      setActiveTicketId(found.id);
      setInputTicketNumber('');
    } else {
      alert(`Không tìm thấy vé số "${inputTicketNumber}". Vui lòng kiểm tra lại mã trên phiếu!`);
    }
  };

  // Check people ahead
  const getPeopleAhead = () => {
    if (!currentTicket || currentTicket.status !== 'waiting') return 0;
    return tickets.filter((t) => {
      if (t.status !== 'waiting') return false;
      if (t.id === currentTicket.id) return false;
      if (currentTicket.isPriority) {
        return t.isPriority && t.issuedAt < currentTicket.issuedAt;
      }
      return t.serviceId === currentTicket.serviceId && t.issuedAt < currentTicket.issuedAt;
    }).length;
  };

  const peopleAhead = getPeopleAhead();
  const estWaitMins = peopleAhead * 12;

  const handleRateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTicket) return;
    rateTicket(currentTicket.id, {
      stars,
      attitudeScore,
      clarityScore,
      speedScore,
      comment: comment.trim() || undefined,
    });
    setHasRated(true);
  };

  const isCallingOrServing = currentTicket?.status === 'calling' || currentTicket?.status === 'serving';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Top Banner Guide */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider mb-2">
          <Smartphone className="w-3.5 h-3.5" />
          {t.mobileBadge}
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {t.mobileTitle}
        </h2>
        <p className="text-sm text-slate-600 mt-1 max-w-xl mx-auto">
          {t.mobileSub}
        </p>

        {/* Quick Ticket Search Bar */}
        <form onSubmit={handleSearch} className="mt-5 max-w-md mx-auto flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={inputTicketNumber}
              onChange={(e) => setInputTicketNumber(e.target.value)}
              placeholder={t.mobileInputPlaceholder}
              className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold uppercase focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            {t.btnLookup}
          </button>
        </form>

        {/* Quick Switcher among active tickets */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 text-xs">
          <span className="text-slate-400 text-[11px]">{t.quickSampleTickets}</span>
          {tickets.slice(0, 5).map((tkt) => (
            <button
              key={tkt.id}
              onClick={() => setActiveTicketId(tkt.id)}
              className={`px-2 py-1 rounded-md font-mono text-[11px] font-bold transition-all cursor-pointer ${
                activeTicketId === tkt.id
                  ? 'bg-slate-900 text-amber-300 shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {tkt.ticketNumber} ({tkt.status === 'calling' ? t.statusCalling : tkt.status === 'serving' ? t.statusServing : t.statsWaiting})
            </button>
          ))}
        </div>
      </div>

      {/* MOBILE DEVICE CONTAINER (Phone Mockup) */}
      <div className="max-w-[390px] mx-auto bg-slate-900 p-3 sm:p-4 rounded-[42px] shadow-2xl border-4 border-slate-800">
        {/* Phone Speaker Notch */}
        <div className="w-28 h-4 bg-slate-800 rounded-full mx-auto mb-3 flex items-center justify-center">
          <div className="w-10 h-1.5 bg-slate-950 rounded-full"></div>
        </div>

        {/* Phone Screen Canvas */}
        <div className="bg-slate-50 rounded-[32px] overflow-hidden min-h-[580px] flex flex-col justify-between border border-slate-200 text-slate-900">
          {/* Mobile Top Header */}
          <div className="bg-gradient-to-r from-red-700 to-amber-700 text-white p-4">
            <div className="flex items-center justify-between text-[11px] opacity-90 mb-1">
              <span>{lang === 'vi' ? config.centerName : t.centerName}</span>
              <span className="font-mono font-bold">{config.hotline}</span>
            </div>
            <div className="text-sm font-black tracking-tight">{t.kioskTitle}</div>
          </div>

          {currentTicket ? (
            <div className="p-4 flex-1 space-y-4">
              {/* TICKET NUMBER BADGE */}
              <div
                className={`p-4 rounded-2xl text-center border-2 transition-all shadow-xs ${
                  currentTicket.status === 'calling'
                    ? 'bg-amber-50 border-amber-400 ring-4 ring-amber-300/40 animate-pulse'
                    : currentTicket.status === 'serving'
                    ? 'bg-emerald-50 border-emerald-400'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {t.ticketNumberLabel}
                </div>
                <div className="text-5xl font-black font-mono text-red-700 tracking-tight my-1">
                  {currentTicket.ticketNumber}
                </div>
                <div className="text-xs font-bold text-slate-800 line-clamp-1">
                  {currentTicket.serviceName}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {currentTicket.department}
                </div>
              </div>

              {/* LIVE CALL ALERT BANNER */}
              {currentTicket.status === 'calling' && (
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 text-white text-center shadow-lg animate-bounce">
                  <div className="flex items-center justify-center gap-1.5 font-black text-xs uppercase tracking-wider">
                    <Bell className="w-4 h-4 fill-white animate-spin" />
                    {t.yourTurnAlert}
                  </div>
                  <div className="text-base font-black mt-0.5">
                    {formatString(t.pleaseProceedTo, { counter: currentTicket.counterName || '' })}
                  </div>
                  <div className="text-[11px] text-amber-100 mt-1">
                    {formatString(t.officerWaiting, { officer: currentTicket.officerName || '' })}
                  </div>
                </div>
              )}

              {/* PROGRESS STEPPER */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-3">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  {t.progressTitle}
                </div>

                <div className="space-y-3 text-xs">
                  {/* Step 1 */}
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-bold text-slate-900">{t.stepTaken}</div>
                      <div className="text-[10px] text-slate-500">
                        {new Date(currentTicket.issuedAt).toLocaleTimeString(lang === 'vi' ? 'vi-VN' : 'en-US')}
                      </div>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center text-[10px] shrink-0 mt-0.5 ${
                        currentTicket.status !== 'waiting'
                          ? 'border-emerald-600 bg-emerald-600 text-white'
                          : 'border-amber-500 bg-amber-50 text-amber-700'
                      }`}
                    >
                      {currentTicket.status !== 'waiting' ? '✓' : '•'}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-slate-900">{t.stepWaiting}</div>
                      {currentTicket.status === 'waiting' && (
                        <div className="text-[11px] text-amber-700 font-medium">
                          {formatString(t.peopleAheadMsg, { count: peopleAhead, mins: estWaitMins })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center text-[10px] shrink-0 mt-0.5 ${
                        currentTicket.status === 'completed'
                          ? 'border-emerald-600 bg-emerald-600 text-white'
                          : isCallingOrServing
                          ? 'border-red-600 bg-red-600 text-white animate-pulse'
                          : 'border-slate-300 text-slate-400'
                      }`}
                    >
                      {currentTicket.status === 'completed' ? '✓' : '3'}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-slate-900">{t.stepAtCounter}</div>
                      {currentTicket.counterName && (
                        <div className="text-[11px] text-slate-600">
                          {currentTicket.counterName} - {currentTicket.officerName}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center text-[10px] shrink-0 mt-0.5 ${
                        currentTicket.status === 'completed'
                          ? 'border-emerald-600 bg-emerald-600 text-white'
                          : 'border-slate-300 text-slate-400'
                      }`}
                    >
                      {currentTicket.status === 'completed' ? '✓' : '4'}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-slate-900">{t.stepDone}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SATISFACTION EVALUATION FORM (WHEN COMPLETED OR DEMO) */}
              {(currentTicket.status === 'completed' || currentTicket.rating) && (
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <h4 className="font-extrabold text-xs text-slate-900 uppercase">
                      {t.ratingTitle}
                    </h4>
                  </div>

                  {hasRated || currentTicket.rating ? (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                      <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-1" />
                      <div className="font-bold text-xs text-emerald-900">
                        {t.ratingSuccess}
                      </div>
                      <p className="text-[10px] text-emerald-700 mt-0.5">
                        {t.ratingSuccessSub}
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleRateSubmit} className="space-y-3 text-xs">
                      {/* Star Rating Buttons */}
                      <div className="flex items-center justify-center gap-2 py-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setStars(star)}
                            className="p-1 cursor-pointer transition-transform hover:scale-125"
                          >
                            <Star
                              className={`w-6 h-6 ${
                                star <= stars
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>

                      {/* Criteria checkboxes */}
                      <div className="space-y-1.5 pt-1">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={attitudeScore}
                            onChange={(e) => setAttitudeScore(e.target.checked)}
                            className="rounded text-red-600"
                          />
                          <span className="text-[11px] text-slate-700">{t.criteriaAttitude}</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={clarityScore}
                            onChange={(e) => setClarityScore(e.target.checked)}
                            className="rounded text-red-600"
                          />
                          <span className="text-[11px] text-slate-700">{t.criteriaClarity}</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={speedScore}
                            onChange={(e) => setSpeedScore(e.target.checked)}
                            className="rounded text-red-600"
                          />
                          <span className="text-[11px] text-slate-700">{t.criteriaSpeed}</span>
                        </label>
                      </div>

                      <textarea
                        rows={2}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder={t.commentPlaceholder}
                        className="w-full p-2 rounded-lg border border-slate-200 text-xs outline-none"
                      ></textarea>

                      <button
                        type="submit"
                        className="w-full py-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Send className="w-3.5 h-3.5" />
                        {t.btnSubmitRating}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400">
              <Search className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <div className="font-bold text-slate-600 text-sm">{t.noTicketSelected}</div>
              <p className="text-xs text-slate-500 mt-1">
                {t.noTicketSelectedSub}
              </p>
            </div>
          )}

          {/* Mobile Bottom Footer */}
          <div className="p-3 bg-slate-100 border-t border-slate-200 text-center text-[10px] text-slate-500">
            {t.hotlineSupport} <strong>{config.hotline}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
