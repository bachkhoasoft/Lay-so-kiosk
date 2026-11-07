import React, { useEffect, useState } from 'react';
import { Ticket, CenterConfig } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { Printer, Smartphone, Check, X, Clock, Users, Building2, ShieldCheck, Heart } from 'lucide-react';
import { QrCodeSvg } from './QrCodeSvg';

interface PrintTicketModalProps {
  ticket: Ticket | null;
  config: CenterConfig;
  waitingAheadCount: number;
  estWaitMinutes: number;
  onClose: () => void;
  onOpenMobileView?: (ticketId: string) => void;
}

export function PrintTicketModal({
  ticket,
  config,
  waitingAheadCount,
  estWaitMinutes,
  onClose,
  onOpenMobileView,
}: PrintTicketModalProps) {
  const { lang, t, formatString } = useLanguage();
  const [countdown, setCountdown] = useState(15);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (!ticket) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [ticket, onClose]);

  if (!ticket) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(ticket.ticketNumber);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const dateStr = new Date(ticket.issuedAt).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 flex flex-col max-h-[95vh]">
        {/* Modal Top Bar */}
        <div className="bg-gradient-to-r from-red-700 via-red-800 to-amber-700 text-white px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-400/20 border border-amber-300 flex items-center justify-center text-amber-300 text-xs font-bold">
              ★
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-wide">{t.ticketIssuedSuccess}</h3>
              <p className="text-[11px] text-amber-200">{formatString(t.autoCloseIn, { seconds: countdown })}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Ticket Area */}
        <div className="p-6 overflow-y-auto flex flex-col items-center bg-slate-100">
          <div
            id="printable-ticket"
            className="w-full max-w-[340px] bg-white p-5 rounded-lg border border-dashed border-slate-400 shadow-md relative"
          >
            {/* Top saw-tooth / thermal receipt perforation effect */}
            <div className="text-center pb-3 border-b border-dashed border-slate-300">
              <div className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                {t.countryName}
              </div>
              <div className="text-[9px] text-slate-500 italic mb-2">
                {t.motto}
              </div>
              <div className="w-8 h-0.5 bg-red-600 mx-auto mb-2"></div>
              <div className="text-xs font-black text-red-700 tracking-tight leading-tight">
                {lang === 'vi' ? config.centerName : t.centerName}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                {config.address}
              </div>
            </div>

            {/* Ticket Header & Number */}
            <div className="my-4 text-center">
              <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-500">
                {t.ticketNumberLabel}
              </div>

              {ticket.isPriority ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-[11px] font-bold mt-1 border border-rose-300">
                  <Heart className="w-3.5 h-3.5 fill-rose-600 text-rose-600" />
                  {t.priorityTitle}
                </div>
              ) : null}

              <div className="my-2 py-3 bg-slate-900 rounded-xl text-white shadow-inner flex flex-col items-center">
                <span className="text-[10px] uppercase tracking-widest text-slate-400">{t.ticketNumberLabel}</span>
                <span className="text-5xl font-black font-mono tracking-tight text-amber-400">
                  {ticket.ticketNumber}
                </span>
                <span className="text-[11px] text-slate-300 mt-0.5 font-medium">
                  {ticket.serviceName}
                </span>
              </div>
            </div>

            {/* Waiting info boxes */}
            <div className="grid grid-cols-2 gap-2 my-3 text-center">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-2">
                <div className="text-[10px] text-amber-800 font-medium flex items-center justify-center gap-1">
                  <Users className="w-3 h-3 text-amber-600" />
                  {t.aheadCount}
                </div>
                <div className="text-xl font-bold text-amber-900">
                  {waitingAheadCount} <span className="text-xs font-normal text-amber-700">{t.peopleUnit}</span>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                <div className="text-[10px] text-blue-800 font-medium flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3 text-blue-600" />
                  {t.estWait}
                </div>
                <div className="text-xl font-bold text-blue-900">
                  ~{estWaitMinutes} <span className="text-xs font-normal text-blue-700">{t.minsUnit}</span>
                </div>
              </div>
            </div>

            {/* Citizen Details */}
            <div className="space-y-1 text-[11px] text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200 mb-3">
              <div className="flex justify-between">
                <span className="text-slate-500">{t.issueTime}</span>
                <span className="font-semibold">{dateStr}</span>
              </div>
              {ticket.citizenName && (
                <div className="flex justify-between">
                  <span className="text-slate-500">{t.citizenNameLabel}</span>
                  <span className="font-bold text-slate-900">{ticket.citizenName}</span>
                </div>
              )}
              {ticket.citizenCccd && (
                <div className="flex justify-between">
                  <span className="text-slate-500">{t.cccdLabel}</span>
                  <span className="font-mono font-medium">{ticket.citizenCccd}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">{t.deptLabel}</span>
                <span className="font-medium text-slate-800 text-right">{ticket.department}</span>
              </div>
            </div>

            {/* QR Code and Mobile Tracker */}
            <div className="border-t border-dashed border-slate-300 pt-3 flex items-center gap-3">
              <QrCodeSvg value={`HCC-TICKET-${ticket.ticketNumber}-${ticket.id}`} size={74} />
              <div className="text-[10px] text-slate-600 leading-snug">
                <p className="font-bold text-slate-900">{t.scanQrNotice}</p>
                <p className="mt-0.5 text-slate-500">
                  {t.scanQrDesc}
                </p>
              </div>
            </div>

            {/* Footer warning */}
            <div className="mt-3 text-center border-t border-slate-200 pt-2 text-[10px] text-slate-500 leading-tight">
              {t.ticketNotice}
              <br />
              <span className="font-semibold text-slate-700">{t.hotlineSupport} {config.hotline}</span>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-white border-t border-slate-200 flex flex-col gap-2">
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="flex-1 py-2.5 px-4 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              {t.btnPrint}
            </button>

            {onOpenMobileView && (
              <button
                onClick={() => onOpenMobileView(ticket.id)}
                className="py-2.5 px-4 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-sm flex items-center justify-center gap-2 border border-blue-200 transition-colors cursor-pointer"
              >
                <Smartphone className="w-4 h-4" />
                {t.btnOpenMobile}
              </button>
            )}
          </div>

          <div className="flex items-center justify-between pt-1 text-xs text-slate-500">
            <button
              onClick={handleCopyCode}
              className="text-slate-600 hover:text-slate-900 underline flex items-center gap-1 cursor-pointer"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : null}
              {copiedLink ? t.copiedSuccess : t.btnCopyCode}
            </button>

            <button
              onClick={onClose}
              className="px-3 py-1 text-slate-600 hover:text-slate-900 font-medium hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              {t.btnClose} ({countdown}s)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
