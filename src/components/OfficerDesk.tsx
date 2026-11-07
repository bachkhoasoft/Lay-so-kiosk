import React, { useState, useEffect } from 'react';
import { useQueue } from '../hooks/useQueue';
import { useLanguage } from '../i18n/LanguageContext';
import { Ticket } from '../types';
import {
  Volume2,
  CheckCircle,
  SkipForward,
  CornerUpRight,
  Play,
  User,
  CreditCard,
  Phone,
  Clock,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Users,
  Check,
  FileText,
  BadgeAlert
} from 'lucide-react';

export function OfficerDesk() {
  const {
    counters,
    tickets,
    services,
    callNext,
    recall,
    startServing,
    completeServing,
    skipTicket,
    transferTicket,
    updateCounterStatus
  } = useQueue();
  const { lang, t, formatString } = useLanguage();

  // Selected counter id (persisted in state)
  const [selectedCounterId, setSelectedCounterId] = useState<number>(() => {
    const saved = localStorage.getItem('hcc_active_counter_id');
    return saved ? parseInt(saved, 10) : 1;
  });

  const [notes, setNotes] = useState('');
  const [transferTargetId, setTransferTargetId] = useState<number>(8); // default to Quầy 08 - Thuế / Trả kết quả
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferReason, setTransferReason] = useState('Chuyển nộp lệ phí và nhận kết quả');
  const [servingSeconds, setServingSeconds] = useState(0);

  // Sync selected counter to localStorage
  const handleSelectCounter = (id: number) => {
    setSelectedCounterId(id);
    localStorage.setItem('hcc_active_counter_id', id.toString());
  };

  const activeCounter = counters.find((c) => c.id === selectedCounterId) || counters[0];

  // Current ticket for active counter
  const currentTicket = activeCounter?.currentTicketId
    ? tickets.find((t) => t.id === activeCounter.currentTicketId) || null
    : null;

  // Waiting tickets for this counter
  const waitingTickets = activeCounter ? useQueue().getWaitingTicketsForCounter(activeCounter.id) : [];

  // Serving duration timer
  useEffect(() => {
    if (!currentTicket || currentTicket.status !== 'serving') {
      setServingSeconds(0);
      return;
    }

    const start = currentTicket.servingStartedAt || Date.now();
    const updateElapsed = () => {
      setServingSeconds(Math.floor((Date.now() - start) / 1000));
    };

    updateElapsed();
    const timer = setInterval(updateElapsed, 1000);
    return () => clearInterval(timer);
  }, [currentTicket]);

  const formatTimer = (totalSecs: number) => {
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
  };

  const handleCallNext = () => {
    if (!activeCounter) return;
    callNext(activeCounter.id);
  };

  const handleRecall = () => {
    if (!activeCounter) return;
    recall(activeCounter.id);
  };

  const handleStartServing = () => {
    if (!activeCounter) return;
    startServing(activeCounter.id);
  };

  const handleComplete = () => {
    if (!activeCounter) return;
    completeServing(activeCounter.id, notes);
    setNotes('');
  };

  const handleSkip = () => {
    if (!activeCounter) return;
    if (confirm('Xác nhận bỏ qua số thứ tự này do công dân không có mặt?')) {
      skipTicket(activeCounter.id, 'Công dân vắng mặt sau các lần gọi');
      setNotes('');
    }
  };

  const handleTransfer = () => {
    if (!currentTicket) return;
    transferTicket(currentTicket.id, transferTargetId, transferReason);
    setIsTransferModalOpen(false);
    setNotes('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* COUNTER WORKSTATION HEADER */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-700 to-amber-700 text-white flex items-center justify-center font-black text-xl font-mono shadow-md">
            {activeCounter.id < 10 ? `Q0${activeCounter.id}` : `Q${activeCounter.id}`}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase">{t.officerDeskTitle}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
              <span className="text-xs text-red-700 font-bold">{activeCounter.officerTitle}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
              {activeCounter.name} - {activeCounter.officerName}
            </h1>
          </div>
        </div>

        {/* Counter Selector & Status Toggle */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-600">{t.switchCounter}</label>
            <select
              value={selectedCounterId}
              onChange={(e) => handleSelectCounter(parseInt(e.target.value, 10))}
              className="px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 font-bold text-xs text-slate-800 outline-none focus:ring-2 focus:ring-red-200 cursor-pointer"
            >
              {counters.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} - {c.officerName} ({c.code})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => updateCounterStatus(activeCounter.id, 'active')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeCounter.status !== 'break' && activeCounter.status !== 'offline'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.statusWorking}
            </button>
            <button
              onClick={() => updateCounterStatus(activeCounter.id, 'break')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeCounter.status === 'break'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.statusBreak}
            </button>
          </div>
        </div>
      </div>

      {/* MAIN WORKSTATION GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT / CENTER: CURRENT SERVING TICKET & CONTROLS (7 COLS) */}
        <div className="lg:col-span-7 space-y-5">
          {/* ACTION BUTTONS BAR */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              {t.controlPanel}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* PRIMARY CALL NEXT BUTTON */}
              <button
                onClick={handleCallNext}
                disabled={waitingTickets.length === 0}
                className="py-4 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-base flex items-center justify-center gap-3 shadow-md shadow-emerald-700/20 active:scale-[0.98] transition-all cursor-pointer"
              >
                <Volume2 className="w-5 h-5" />
                <span>{t.btnCallNext}</span>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs font-bold">
                  {waitingTickets.length} {t.waitingBadge}
                </span>
              </button>

              {/* RE-CALL CURRENT BUTTON */}
              <button
                onClick={handleRecall}
                disabled={!currentTicket}
                className="py-4 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-base flex items-center justify-center gap-2 shadow-md shadow-blue-700/20 active:scale-[0.98] transition-all cursor-pointer"
              >
                <RotateCcw className="w-5 h-5" />
                <span>{t.btnRecall}</span>
              </button>
            </div>

            {/* SECONDARY LIFECYCLE BUTTONS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-100">
              <button
                onClick={handleStartServing}
                disabled={!currentTicket || currentTicket.status === 'serving'}
                className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>{t.btnStartServing}</span>
              </button>

              <button
                onClick={handleComplete}
                disabled={!currentTicket}
                className="py-2.5 px-3 rounded-xl bg-red-700 hover:bg-red-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{t.btnComplete}</span>
              </button>

              <button
                onClick={handleSkip}
                disabled={!currentTicket}
                className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <SkipForward className="w-4 h-4" />
                <span>{t.btnSkip}</span>
              </button>

              <button
                onClick={() => setIsTransferModalOpen(true)}
                disabled={!currentTicket}
                className="py-2.5 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 disabled:opacity-40 disabled:cursor-not-allowed text-purple-700 border border-purple-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <CornerUpRight className="w-4 h-4" />
                <span>{t.btnTransfer}</span>
              </button>
            </div>
          </div>

          {/* CURRENT ACTIVE TICKET CARD */}
          <div className="bg-white rounded-2xl p-6 border-2 border-slate-200 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
                <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  {t.currentServingCard}
                </span>
              </div>

              {currentTicket && (
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                      currentTicket.status === 'calling'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    }`}
                  >
                    {currentTicket.status === 'calling' ? t.statusCallingCitizen : t.statusProcessing}
                  </span>
                </div>
              )}
            </div>

            {currentTicket ? (
              <div className="space-y-5">
                {/* Huge Number & Service */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 rounded-2xl p-5 text-white">
                  <div>
                    <div className="text-xs uppercase text-slate-400 font-medium">{t.ticketNumberLabel}</div>
                    <div className="text-6xl font-black font-mono text-amber-400 tracking-tight">
                      {currentTicket.ticketNumber}
                    </div>
                    {currentTicket.isPriority && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[11px] font-bold mt-2">
                        ★ {t.priorityTitle}
                      </div>
                    )}
                  </div>

                  <div className="sm:text-right border-t sm:border-t-0 sm:border-l border-white/10 pt-3 sm:pt-0 sm:pl-6">
                    <div className="text-xs uppercase text-slate-400 font-medium">{t.serviceField}</div>
                    <div className="text-lg font-bold text-white mt-0.5">
                      {currentTicket.serviceName}
                    </div>
                    <div className="text-xs text-slate-300 mt-1">
                      {currentTicket.department}
                    </div>

                    {/* Timer */}
                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/10 text-amber-300 text-xs font-mono font-bold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{t.servingDuration} {formatTimer(servingSeconds)}</span>
                    </div>
                  </div>
                </div>

                {/* Citizen Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-500 block font-medium">{t.labelFullName}:</span>
                    <span className="text-slate-900 font-bold text-sm">
                      {currentTicket.citizenName || '---'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-medium">{t.labelCccd}:</span>
                    <span className="text-slate-900 font-mono font-bold">
                      {currentTicket.citizenCccd || '---'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-medium">{t.labelPhone}:</span>
                    <span className="text-slate-900 font-mono font-bold">
                      {currentTicket.citizenPhone || '---'}
                    </span>
                  </div>
                </div>

                {currentTicket.priorityReason && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 flex items-start gap-2">
                    <BadgeAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>{t.priorityChooseReason}</strong> {currentTicket.priorityReason}
                    </div>
                  </div>
                )}

                {/* Officer Notes Area */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">
                    {t.officerNotesLabel}
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t.notesPlaceholder}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-none"
                  ></textarea>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400">
                <Users className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                <div className="font-bold text-slate-600 text-base">{t.noCurrentTicket}</div>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  {t.pressCallNextHint}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: WAITING QUEUE LIST & COUNTER PRODUCTIVITY (5 COLS) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Waiting Queue Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col h-[520px]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-600" />
                  {t.queueAtThisCounter} ({waitingTickets.length})
                </h3>
                <p className="text-[11px] text-slate-500">{t.sortNotice}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {waitingTickets.length > 0 ? (
                waitingTickets.map((ticket, index) => {
                  const waitMinutes = Math.floor((Date.now() - ticket.issuedAt) / 60000);

                  return (
                    <div
                      key={ticket.id}
                      className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                        ticket.isPriority
                          ? 'bg-rose-50/80 border-rose-300'
                          : index === 0
                          ? 'bg-amber-50/70 border-amber-300'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                          {index + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-base text-slate-900">
                              {ticket.ticketNumber}
                            </span>
                            {ticket.isPriority && (
                              <span className="px-1.5 py-0.5 rounded-sm bg-rose-600 text-white font-bold text-[10px]">
                                {t.codePrefix} P
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-600 font-medium line-clamp-1">
                            {ticket.citizenName ? `${ticket.citizenName} • ` : ''}
                            {ticket.serviceName}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {formatString(t.waitedMins, { mins: waitMinutes })}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          callNext(activeCounter.id);
                        }}
                        title={t.btnCallThisNow}
                        className="p-2 rounded-lg bg-white hover:bg-emerald-50 text-emerald-700 border border-slate-200 hover:border-emerald-300 shadow-2xs text-xs font-bold shrink-0 transition-colors cursor-pointer"
                      >
                        {t.btnCallThisNow}
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                  <Check className="w-10 h-10 text-emerald-500 mb-2" />
                  <div className="font-bold text-slate-700 text-sm">{t.noWaitingTickets}</div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {t.allTicketsDone}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Daily Productivity Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-2xl shadow-sm">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-3">
              {t.counterProductivityToday}
            </h4>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                <div className="text-xs text-slate-300">{t.solvedCount}</div>
                <div className="text-2xl font-black text-amber-400 mt-0.5">
                  {activeCounter.servingCountToday}
                </div>
                <div className="text-[10px] text-slate-400">{t.peopleUnit}</div>
              </div>
              <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                <div className="text-xs text-slate-300">{t.avgMinutes}</div>
                <div className="text-2xl font-black text-emerald-400 mt-0.5">
                  {activeCounter.averageServingMinutes}
                </div>
                <div className="text-[10px] text-slate-400">{t.minsPerDoc}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: TRANSFER TICKET */}
      {isTransferModalOpen && currentTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="bg-gradient-to-r from-purple-700 to-indigo-700 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-base">{t.transferModalTitle}</h3>
              <button
                onClick={() => setIsTransferModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white/80"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <span className="text-slate-500 font-medium">Hồ sơ:</span>
                <div className="font-bold text-base text-slate-900">
                  {currentTicket.ticketNumber} - {currentTicket.serviceName}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5 uppercase">
                  {t.transferTargetCounter}
                </label>
                <select
                  value={transferTargetId}
                  onChange={(e) => setTransferTargetId(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-semibold text-slate-800 outline-none"
                >
                  {counters
                    .filter((c) => c.id !== activeCounter.id)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} - {c.officerName} ({c.officerTitle})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5 uppercase">
                  {t.transferReasonLabel}
                </label>
                <input
                  type="text"
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  placeholder={t.transferReasonPlaceholder}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-medium outline-none"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={handleTransfer}
                  className="flex-1 py-3 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold transition-colors cursor-pointer"
                >
                  {t.btnConfirmTransfer}
                </button>
                <button
                  onClick={() => setIsTransferModalOpen(false)}
                  className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors cursor-pointer"
                >
                  {t.btnCancel}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
