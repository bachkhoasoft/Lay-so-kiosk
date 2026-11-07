/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header, AppMode } from './components/Header';
import { KioskMode } from './components/KioskMode';
import { LobbyDisplay } from './components/LobbyDisplay';
import { OfficerDesk } from './components/OfficerDesk';
import { CitizenMobileTicket } from './components/CitizenMobileTicket';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { SettingsModal } from './components/SettingsModal';
import { useLanguage } from './i18n/LanguageContext';
import { Monitor, ArrowLeft } from 'lucide-react';

export default function App() {
  const { t } = useLanguage();
  const [mode, setMode] = useState<AppMode>('kiosk');
  const [mobileTicketId, setMobileTicketId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleOpenMobileView = (ticketId: string) => {
    setMobileTicketId(ticketId);
    setMode('mobile');
  };

  // If in Lobby Mode (TV screen), allow full immersive view with a subtle floating exit pill
  if (mode === 'lobby') {
    return (
      <div className="relative min-h-screen">
        {/* Floating Switcher Pill for TV display */}
        <div className="fixed top-2 right-24 z-50 opacity-20 hover:opacity-100 transition-opacity">
          <button
            onClick={() => setMode('kiosk')}
            className="px-3 py-1.5 rounded-full bg-slate-900/90 text-white text-xs font-bold flex items-center gap-1.5 shadow-xl border border-white/20 hover:bg-red-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t.exitTv}</span>
          </button>
        </div>

        <LobbyDisplay />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Header
        currentMode={mode}
        onSelectMode={setMode}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <main className="flex-1">
        {mode === 'kiosk' && (
          <KioskMode onOpenMobileView={handleOpenMobileView} />
        )}
        {mode === 'officer' && (
          <OfficerDesk />
        )}
        {mode === 'mobile' && (
          <CitizenMobileTicket initialTicketId={mobileTicketId} />
        )}
        {mode === 'analytics' && (
          <AnalyticsDashboard />
        )}
      </main>

      {/* Global Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
