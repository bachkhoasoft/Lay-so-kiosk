import React from 'react';
import { useQueue } from '../hooks/useQueue';
import { useLanguage } from '../i18n/LanguageContext';
import {
  TrendingUp,
  Users,
  CheckCircle2,
  Clock,
  Star,
  Download,
  Building2,
  AlertTriangle,
  ThumbsUp,
  FileCheck,
  RotateCcw,
  Sparkles
} from 'lucide-react';

export function AnalyticsDashboard() {
  const { tickets, counters, services, config } = useQueue();
  const { lang, t, formatString } = useLanguage();

  const totalTickets = tickets.length;
  const completedTickets = tickets.filter((t) => t.status === 'completed');
  const servingTickets = tickets.filter((t) => t.status === 'serving' || t.status === 'calling');
  const waitingTickets = tickets.filter((t) => t.status === 'waiting');
  const skippedTickets = tickets.filter((t) => t.status === 'skipped');
  const priorityTickets = tickets.filter((t) => t.isPriority);

  // Ratings calculation
  const ratedTickets = tickets.filter((t) => t.rating && t.rating.stars > 0);
  const avgRating =
    ratedTickets.length > 0
      ? (
          ratedTickets.reduce((acc, t) => acc + (t.rating?.stars || 0), 0) /
          ratedTickets.length
        ).toFixed(1)
      : '5.0';

  const satisfactionPercent =
    ratedTickets.length > 0
      ? Math.round(
          (ratedTickets.filter((t) => (t.rating?.stars || 0) >= 4).length /
            ratedTickets.length) *
            100
        )
      : 99;

  // Average wait duration (in minutes) for completed tickets
  const totalWaitMins = completedTickets.reduce((acc, t) => {
    if (t.calledAt && t.issuedAt) {
      return acc + (t.calledAt - t.issuedAt) / 60000;
    }
    return acc + 10;
  }, 0);
  const avgWaitMins =
    completedTickets.length > 0
      ? Math.round(totalWaitMins / completedTickets.length)
      : 11;

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Mã phiếu', 'Lĩnh vực', 'Công dân', 'CCCD', 'Ưu tiên', 'Thời gian cấp', 'Trạng thái', 'Quầy', 'Đánh giá'];
    const rows = tickets.map((t) => [
      t.ticketNumber,
      `"${t.serviceName}"`,
      `"${t.citizenName || ''}"`,
      `"${t.citizenCccd || ''}"`,
      t.isPriority ? 'Có' : 'Không',
      `"${new Date(t.issuedAt).toLocaleString('vi-VN')}"`,
      t.status,
      `"${t.counterName || ''}"`,
      t.rating?.stars || ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Bao_cao_xep_hang_HCC_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="text-xs font-bold text-red-700 uppercase tracking-wider">
            {t.analyticsTitle}
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
            {t.analyticsHeader}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {formatString(t.analyticsSub, { centerName: lang === 'vi' ? config.centerName : t.centerName })}
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>{t.btnExportCsv}</span>
        </button>
      </div>

      {/* KPI METRICS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Issued */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase">{t.kpiTotalIssued}</div>
          <div className="text-3xl font-black text-slate-900 mt-1 font-mono">
            {totalTickets}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
            <span className="text-emerald-600 font-bold">100%</span>
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/40 shadow-xs">
          <div className="text-[11px] font-bold text-emerald-800 uppercase">{t.kpiCompleted}</div>
          <div className="text-3xl font-black text-emerald-700 mt-1 font-mono">
            {completedTickets.length}
          </div>
          <div className="text-[10px] text-emerald-600 mt-1 font-medium">
            {totalTickets > 0 ? Math.round((completedTickets.length / totalTickets) * 100) : 0}%
          </div>
        </div>

        {/* Serving */}
        <div className="bg-white p-4 rounded-2xl border border-blue-200 bg-blue-50/40 shadow-xs">
          <div className="text-[11px] font-bold text-blue-800 uppercase">{t.kpiServing}</div>
          <div className="text-3xl font-black text-blue-700 mt-1 font-mono">
            {servingTickets.length}
          </div>
          <div className="text-[10px] text-blue-600 mt-1 font-medium">
            {counters.filter(c => c.status === 'busy').length} {t.thCounter.toLowerCase()}
          </div>
        </div>

        {/* Waiting */}
        <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/40 shadow-xs">
          <div className="text-[11px] font-bold text-amber-800 uppercase">{t.kpiWaiting}</div>
          <div className="text-3xl font-black text-amber-700 mt-1 font-mono">
            {waitingTickets.length}
          </div>
          <div className="text-[10px] text-amber-700 mt-1 font-medium">
            {waitingTickets.filter(t => t.isPriority).length} {t.codePrefix} P
          </div>
        </div>

        {/* Avg Wait Time */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase">{t.kpiAvgWait}</div>
          <div className="text-3xl font-black text-slate-900 mt-1 font-mono">
            {avgWaitMins} <span className="text-sm font-sans font-bold text-slate-500">{t.minsUnit}</span>
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-1">
            {t.kpiAvgWaitSub}
          </div>
        </div>

        {/* CSAT / Satisfaction */}
        <div className="bg-white p-4 rounded-2xl border border-amber-300 bg-amber-50/30 shadow-xs">
          <div className="text-[11px] font-bold text-amber-800 uppercase flex items-center justify-between">
            <span>{t.kpiCsat}</span>
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-amber-700 mt-1 font-mono flex items-baseline gap-1">
            {avgRating} <span className="text-xs font-sans text-amber-600">/ 5.0</span>
          </div>
          <div className="text-[10px] text-amber-800 font-bold mt-1">
            {formatString(t.kpiCsatSub, { percent: satisfactionPercent })}
          </div>
        </div>
      </div>

      {/* CHARTS & DISTRIBUTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SERVICES DISTRIBUTION (7 COLS) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-red-700" />
              {t.distributionTitle}
            </h3>
          </div>

          <div className="space-y-4">
            {services.map((service) => {
              const count = tickets.filter((t) => t.serviceId === service.id).length;
              const completedCount = tickets.filter(
                (t) => t.serviceId === service.id && t.status === 'completed'
              ).length;
              const percent = totalTickets > 0 ? Math.round((count / totalTickets) * 100) : 0;

              return (
                <div key={service.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${service.colorScheme.badge}`}>
                        {service.code}
                      </span>
                      <span className="font-bold text-slate-800">{service.name}</span>
                    </div>
                    <div className="text-slate-600">
                      <strong className="text-slate-900">{count}</strong> lượt ({completedCount} xong) -{' '}
                      <span className="font-semibold text-slate-500">{percent}%</span>
                    </div>
                  </div>

                  {/* Visual Bar */}
                  <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        service.id === 'priority'
                          ? 'bg-rose-500'
                          : service.id === 'judicial'
                          ? 'bg-amber-500'
                          : service.id === 'land'
                          ? 'bg-emerald-500'
                          : service.id === 'business'
                          ? 'bg-blue-500'
                          : 'bg-indigo-500'
                      }`}
                      style={{ width: `${Math.max(percent, 4)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CITIZEN REVIEWS & FEEDBACK (5 COLS) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="border-b border-slate-100 pb-3 mb-3 flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              {t.citizenFeedbackTitle}
            </h3>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              {formatString(t.feedbackCountBadge, { count: ratedTickets.length })}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 max-h-[360px] pr-1">
            {ratedTickets.length > 0 ? (
              ratedTickets.map((tkt) => (
                <div
                  key={tkt.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-slate-900">{tkt.ticketNumber}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-600 truncate max-w-[140px]">{tkt.counterName}</span>
                    </div>

                    {/* Stars */}
                    <div className="flex items-center text-amber-400">
                      {Array.from({ length: tkt.rating?.stars || 5 }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400" />
                      ))}
                    </div>
                  </div>

                  {tkt.rating?.comment && (
                    <p className="text-slate-700 italic bg-white p-2 rounded-lg border border-slate-200">
                      "{tkt.rating.comment}"
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 text-[10px] text-slate-500 pt-0.5">
                    {tkt.rating?.attitudeScore && (
                      <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                        ✓ {t.criteriaAttitude}
                      </span>
                    )}
                    {tkt.rating?.clarityScore && (
                      <span className="text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                        ✓ {t.criteriaClarity}
                      </span>
                    )}
                    {tkt.rating?.speedScore && (
                      <span className="text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
                        ✓ {t.criteriaSpeed}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs">
                {t.noFeedbackYet}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* COUNTER PERFORMANCE TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-700" />
            {t.counterPerfTitle}
          </h3>
          <span className="text-xs text-slate-500 font-medium">{formatString(t.totalCountersCount, { count: counters.length })}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">{t.thCounter}</th>
                <th className="py-3 px-4">{t.thOfficer}</th>
                <th className="py-3 px-4">{t.thFields}</th>
                <th className="py-3 px-4 text-center">{t.thCompleted}</th>
                <th className="py-3 px-4 text-center">{t.thAvgTime}</th>
                <th className="py-3 px-4 text-center">{t.thStatus}</th>
                <th className="py-3 px-4 text-right">{t.thCurrent}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {counters.map((counter) => {
                const currentTicket = tickets.find((tkt) => tkt.id === counter.currentTicketId);

                return (
                  <tr key={counter.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 text-sm">
                      {counter.name}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{counter.officerName}</div>
                      <div className="text-[11px] text-slate-500">{counter.officerTitle}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {counter.assignedServices.map((sid) => {
                          const s = services.find((x) => x.id === sid);
                          return (
                            <span
                              key={sid}
                              className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[10px]"
                            >
                              {s?.code || sid}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-900 font-mono text-sm">
                      {counter.servingCountToday}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-medium">
                      {counter.averageServingMinutes} {t.minsUnit}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {counter.status === 'busy' ? (
                        <span className="px-2 py-1 rounded-full bg-red-100 text-red-800 font-bold text-[10px]">
                          {t.statusServing}
                        </span>
                      ) : counter.status === 'break' ? (
                        <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                          {t.statusBreak}
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                          {t.statusReady}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {currentTicket ? (
                        <span className="font-mono font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                          {currentTicket.ticketNumber}
                        </span>
                      ) : (
                        <span className="text-slate-400">---</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
