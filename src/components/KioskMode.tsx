import React, { useState } from 'react';
import { useQueue } from '../hooks/useQueue';
import { useLanguage } from '../i18n/LanguageContext';
import { ServiceCategory, Ticket } from '../types';
import { PrintTicketModal } from './PrintTicketModal';
import {
  Heart,
  Scale,
  MapPinHouse,
  Briefcase,
  ShieldAlert,
  Car,
  Receipt,
  Search,
  Sparkles,
  Info,
  Clock,
  UserCheck,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  FileText,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  HeartHandshake: Heart,
  Scale: Scale,
  MapPinHouse: MapPinHouse,
  Briefcase: Briefcase,
  ShieldAlert: ShieldAlert,
  Car: Car,
  Receipt: Receipt,
  ReceiptCheck: Receipt,
};

interface KioskModeProps {
  onOpenMobileView?: (ticketId: string) => void;
}

export function KioskMode({ onOpenMobileView }: KioskModeProps) {
  const { services, config, issueTicket, tickets } = useQueue();
  const { t, formatString } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState<ServiceCategory | null>(null);
  const [isPriorityModalOpen, setIsPriorityModalOpen] = useState(false);
  const [expandedDocServiceId, setExpandedDocServiceId] = useState<string | null>(null);

  // Form input state
  const [citizenName, setCitizenName] = useState('');
  const [citizenCccd, setCitizenCccd] = useState('');
  const [citizenPhone, setCitizenPhone] = useState('');
  const [priorityReason, setPriorityReason] = useState('Người cao tuổi (trên 75 tuổi)');

  // Printed ticket state
  const [issuedTicket, setIssuedTicket] = useState<Ticket | null>(null);

  // Calculate waiting counts
  const waitingTickets = tickets.filter((t) => t.status === 'waiting');
  const servingTickets = tickets.filter((t) => t.status === 'serving' || t.status === 'calling');
  const completedTickets = tickets.filter((t) => t.status === 'completed');

  const filteredServices = services.filter((s) => {
    if (s.id === 'priority') return false; // Handled separately as special top hero
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.code.toLowerCase().includes(q) ||
      s.department.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.requiredDocsHint.some((d) => d.toLowerCase().includes(q))
    );
  });

  const priorityService = services.find((s) => s.id === 'priority');

  const handleOpenTicketForm = (service: ServiceCategory) => {
    setSelectedService(service);
    setCitizenName('');
    setCitizenCccd('');
    setCitizenPhone('');
  };

  const handleQuickIssue = (service: ServiceCategory, isPriority = false, customReason?: string) => {
    const newTicket = issueTicket({
      serviceId: service.id,
      isPriority,
      priorityReason: isPriority ? customReason || priorityReason : undefined,
      citizenName: citizenName || undefined,
      citizenCccd: citizenCccd || undefined,
      citizenPhone: citizenPhone || undefined,
    });

    setSelectedService(null);
    setIsPriorityModalOpen(false);
    setIssuedTicket(newTicket);
  };

  // Get waiting ahead count for a given newly issued ticket
  const getWaitingAhead = (ticket: Ticket | null) => {
    if (!ticket) return { ahead: 0, waitMins: 0 };
    const ahead = waitingTickets.filter((t) => {
      if (t.id === ticket.id) return false;
      if (ticket.isPriority) {
        return t.isPriority && t.issuedAt < ticket.issuedAt;
      }
      return t.serviceId === ticket.serviceId && t.issuedAt < ticket.issuedAt;
    }).length;

    const service = services.find((s) => s.id === ticket.serviceId);
    const est = ahead * (service?.estMinutesPerCitizen || 12);
    return { ahead, waitMins: Math.max(est, 5) };
  };

  const { ahead: waitingAheadCount, waitMins: estWaitMinutes } = getWaitingAhead(issuedTicket);

  return (
    <div className="min-h-full pb-16 bg-slate-50">
      {/* Top Banner Guide for Kiosk */}
      <div className="bg-gradient-to-r from-red-800 via-red-900 to-amber-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-2 border border-amber-400/30">
                <Sparkles className="w-3.5 h-3.5" />
                {t.kioskTitle}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {t.kioskWelcome}
              </h1>
              <p className="text-sm text-slate-200 mt-1 max-w-2xl">
                {t.kioskSub}
              </p>
            </div>

            {/* Live Stats Pill */}
            <div className="flex items-center gap-2 sm:gap-3 bg-black/25 backdrop-blur-xs p-3 rounded-2xl border border-white/10 self-start md:self-auto">
              <div className="px-3 py-1.5 bg-white/10 rounded-xl text-center">
                <div className="text-xs text-slate-300 font-medium">{t.statsWaiting}</div>
                <div className="text-xl font-black text-amber-400">{waitingTickets.length}</div>
              </div>
              <div className="w-px h-8 bg-white/20"></div>
              <div className="px-3 py-1.5 bg-white/10 rounded-xl text-center">
                <div className="text-xs text-slate-300 font-medium">{t.statsServing}</div>
                <div className="text-xl font-black text-emerald-400">{servingTickets.length}</div>
              </div>
              <div className="w-px h-8 bg-white/20"></div>
              <div className="px-3 py-1.5 bg-white/10 rounded-xl text-center">
                <div className="text-xs text-slate-300 font-medium">{t.statsDone}</div>
                <div className="text-xl font-black text-blue-300">{completedTickets.length}</div>
              </div>
            </div>
          </div>

          {/* Quick Steps Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-5 pt-4 border-t border-white/10 text-xs text-slate-200">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-900 font-bold flex items-center justify-center text-[11px]">1</span>
              <span>{t.step1}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-900 font-bold flex items-center justify-center text-[11px]">2</span>
              <span>{t.step2}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-900 font-bold flex items-center justify-center text-[11px]">3</span>
              <span>{t.step3}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* PRIORITY FLOW HERO BUTTON - Red & Gold Warm Card */}
        {priorityService && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 p-1 shadow-lg shadow-rose-900/10 hover:shadow-xl transition-all">
            <div className="bg-rose-50/95 backdrop-blur-xs rounded-[14px] p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-rose-200">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center text-white shadow-md shadow-rose-600/30 shrink-0">
                  <Heart className="w-8 h-8 fill-white/90" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-200 text-rose-900 text-xs font-bold uppercase tracking-wide mb-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-rose-700" />
                    {t.priorityPolicy}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-rose-950">
                    {t.priorityTitle}
                  </h2>
                  <p className="text-sm text-rose-800 mt-1 max-w-2xl font-medium">
                    {t.priorityDesc}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsPriorityModalOpen(true)}
                className="py-3.5 px-6 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-extrabold text-base flex items-center justify-center gap-3 shadow-lg shadow-red-700/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shrink-0"
              >
                <span>{t.btnTakePriority}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-red-600 focus:ring-2 focus:ring-red-100 text-sm font-medium outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="text-xs text-slate-500 font-medium self-end sm:self-center">
            {formatString(t.showingServices, { count: filteredServices.length })}
          </div>
        </div>

        {/* Service Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredServices.map((service) => {
            const IconComponent = ICON_MAP[service.iconName] || FileText;
            const waitingCount = tickets.filter(
              (t) => t.serviceId === service.id && t.status === 'waiting'
            ).length;
            const isDocsExpanded = expandedDocServiceId === service.id;

            return (
              <div
                key={service.id}
                className={`bg-white rounded-2xl border-2 ${service.colorScheme.border} shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group`}
              >
                <div className="p-5 flex-1">
                  {/* Category Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${service.colorScheme.bg} ${service.colorScheme.text} border border-slate-200/60 shadow-xs group-hover:scale-105 transition-transform`}
                      >
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-md font-mono font-black text-xs ${service.colorScheme.badge}`}
                          >
                            {t.codePrefix} {service.code}
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium">
                            {t.counterLabel}: {service.targetCounters.map((c) => `Q${c < 10 ? '0' + c : c}`).join(', ')}
                          </span>
                        </div>
                        <h3 className="font-extrabold text-base text-slate-900 mt-0.5 group-hover:text-red-700 transition-colors">
                          {service.name}
                        </h3>
                      </div>
                    </div>
                  </div>

                  {/* Department & Description */}
                  <div className="text-xs font-semibold text-slate-500 mb-2">
                    {service.department}
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                    {service.description}
                  </p>

                  {/* Waiting Info Badge */}
                  <div className="flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-slate-50 border border-slate-200/80 mb-3">
                    <span className="text-slate-600 font-medium">{t.waitingCountLabel}</span>
                    <span className="font-bold text-slate-900">
                      {waitingCount} <span className="font-normal text-slate-500">{t.peopleUnit}</span>
                    </span>
                  </div>

                  {/* Required Documents Toggle */}
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedDocServiceId(isDocsExpanded ? null : service.id)
                    }
                    className="w-full text-left text-[11px] font-semibold text-slate-500 hover:text-slate-800 flex items-center justify-between py-1 px-1 rounded-md hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-slate-400" />
                      {t.requiredDocs} ({service.requiredDocsHint.length})
                    </span>
                    {isDocsExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {isDocsExpanded && (
                    <div className="mt-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-700 space-y-1.5 animate-in fade-in duration-150">
                      <div className="font-bold text-slate-900">{t.docsWarning}</div>
                      {service.requiredDocsHint.map((doc, idx) => (
                        <div key={idx} className="flex items-start gap-1.5">
                          <span className="text-emerald-600 font-bold">•</span>
                          <span>{doc}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Bottom Action */}
                <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex gap-2">
                  <button
                    onClick={() => handleQuickIssue(service)}
                    className="flex-1 py-3 px-3 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                  >
                    <span>{t.btnTakeNow}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleOpenTicketForm(service)}
                    title={t.labelCccd}
                    className="py-3 px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4 text-slate-500" />
                    <span className="hidden sm:inline">{t.btnInputCitizen}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Helpful Info Footer Box */}
        <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center text-amber-800 shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-amber-900">
                {t.needHelp}
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                {t.needHelpDesc}{' '}
                <strong>{config.hotline}</strong>.
              </p>
            </div>
          </div>
          <div className="text-xs text-amber-900/80 font-medium">
            {config.operatingHours}
          </div>
        </div>
      </div>

      {/* MODAL: INPUT CITIZEN INFO (OPTIONAL FORM) */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="bg-gradient-to-r from-red-700 to-red-800 text-white p-5 flex items-center justify-between">
              <div>
                <div className="text-xs text-amber-300 font-bold uppercase tracking-wider">
                  {t.confirmTicketModal}
                </div>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  {selectedService.name} ({t.codePrefix} {selectedService.code})
                </h3>
              </div>
              <button
                onClick={() => setSelectedService(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  {t.optionalInfoNote}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                  {t.labelFullName}
                </label>
                <input
                  type="text"
                  value={citizenName}
                  onChange={(e) => setCitizenName(e.target.value)}
                  placeholder={t.placeholderFullName}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-red-600 focus:ring-2 focus:ring-red-100 text-sm font-medium outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                    {t.labelCccd}
                  </label>
                  <input
                    type="text"
                    value={citizenCccd}
                    onChange={(e) => setCitizenCccd(e.target.value)}
                    placeholder={t.placeholderCccd}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-red-600 focus:ring-2 focus:ring-red-100 text-sm font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                    {t.labelPhone}
                  </label>
                  <input
                    type="tel"
                    value={citizenPhone}
                    onChange={(e) => setCitizenPhone(e.target.value)}
                    placeholder={t.placeholderPhone}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-red-600 focus:ring-2 focus:ring-red-100 text-sm font-mono outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={() => handleQuickIssue(selectedService)}
                  className="flex-1 py-3.5 px-4 rounded-xl bg-red-700 hover:bg-red-800 text-white font-extrabold text-sm uppercase tracking-wide flex items-center justify-center gap-2 shadow-md shadow-red-700/20 transition-all cursor-pointer"
                >
                  <span>{t.btnConfirmIssue}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedService(null)}
                  className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors cursor-pointer"
                >
                  {t.btnCancel}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PRIORITY TICKET REASON SELECTOR */}
      {isPriorityModalOpen && priorityService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-rose-200">
            <div className="bg-gradient-to-r from-rose-700 to-red-700 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Heart className="w-6 h-6 fill-rose-200 text-rose-200" />
                <div>
                  <div className="text-xs text-rose-200 font-bold uppercase tracking-wider">
                    {t.priorityPolicy}
                  </div>
                  <h3 className="text-lg font-bold text-white">{t.priorityModalTitle}</h3>
                </div>
              </div>
              <button
                onClick={() => setIsPriorityModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="text-xs text-slate-600 font-medium">
                {t.priorityChooseReason}
              </div>

              <div className="space-y-2">
                {[
                  'Người cao tuổi (Từ 75 tuổi trở lên)',
                  'Người khuyết tật nặng hoặc đặc biệt nặng',
                  'Phụ nữ đang mang thai',
                  'Người dẫn theo trẻ nhỏ dưới 36 tháng tuổi',
                  'Người có công với Cách mạng, Thương bệnh binh',
                ].map((reason) => (
                  <label
                    key={reason}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      priorityReason === reason
                        ? 'border-rose-500 bg-rose-50/80 text-rose-950 font-bold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 font-medium'
                    }`}
                  >
                    <input
                      type="radio"
                      name="priorityReason"
                      value={reason}
                      checked={priorityReason === reason}
                      onChange={() => setPriorityReason(reason)}
                      className="w-4 h-4 text-rose-600 focus:ring-rose-500"
                    />
                    <span className="text-xs sm:text-sm">{reason}</span>
                  </label>
                ))}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                  {t.priorityFullName}
                </label>
                <input
                  type="text"
                  value={citizenName}
                  onChange={(e) => setCitizenName(e.target.value)}
                  placeholder="Ví dụ: Cụ Nguyễn Văn Nam"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-rose-600 focus:ring-2 focus:ring-rose-100 text-sm outline-none"
                />
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={() => handleQuickIssue(priorityService, true, priorityReason)}
                  className="flex-1 py-3.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-extrabold text-sm uppercase tracking-wide flex items-center justify-center gap-2 shadow-md shadow-rose-700/20 transition-all cursor-pointer"
                >
                  <Heart className="w-4 h-4 fill-white" />
                  <span>{t.btnTakePriority}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPriorityModalOpen(false)}
                  className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors cursor-pointer"
                >
                  {t.btnCancel}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRINT TICKET POPUP */}
      <PrintTicketModal
        ticket={issuedTicket}
        config={config}
        waitingAheadCount={waitingAheadCount}
        estWaitMinutes={estWaitMinutes}
        onClose={() => setIssuedTicket(null)}
        onOpenMobileView={onOpenMobileView}
      />
    </div>
  );
}
