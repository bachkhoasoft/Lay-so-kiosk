import React, { useState } from 'react';
import { useQueue } from '../hooks/useQueue';
import { soundService } from '../services/soundService';
import { useLanguage } from '../i18n/LanguageContext';
import {
  Volume2,
  RotateCcw,
  RefreshCw,
  Save,
  X,
  Sliders,
  Building,
  CheckCircle2
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { config, updateConfig, resetDay, seedSampleData } = useQueue();
  const { t, lang } = useLanguage();

  const [centerName, setCenterName] = useState(config.centerName);
  const [subTitle, setSubTitle] = useState(config.subTitle);
  const [address, setAddress] = useState(config.address);
  const [hotline, setHotline] = useState(config.hotline);
  const [soundEnabled, setSoundEnabled] = useState(config.soundEnabled);
  const [voiceVolume, setVoiceVolume] = useState(config.voiceVolume);
  const [voiceRate, setVoiceRate] = useState(config.voiceRate);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig({
      centerName,
      subTitle,
      address,
      hotline,
      soundEnabled,
      voiceVolume,
      voiceRate,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  const handleTestAudio = () => {
    soundService.announce('A-108', lang === 'vi' ? 'Quầy số 01' : 'Counter 01', {
      volume: voiceVolume,
      rate: voiceRate,
    });
  };

  const handleResetConfirm = () => {
    const confirmMsg = lang === 'vi' 
      ? 'Bạn có chắc muốn đặt lại toàn bộ số thứ tự về 001 cho ngày mới?' 
      : 'Are you sure you want to reset all queue numbers to 001?';
    if (confirm(confirmMsg)) {
      resetDay();
      alert(lang === 'vi' ? 'Đã đặt lại hàng đợi thành công!' : 'Queue reset successfully!');
    }
  };

  const handleSeedConfirm = () => {
    const confirmMsg = lang === 'vi'
      ? 'Nạp lại dữ liệu mẫu (các vé đang chờ, đang phục vụ và đánh giá)?'
      : 'Reload sample demo queue tickets and reviews?';
    if (confirm(confirmMsg)) {
      seedSampleData();
      alert(lang === 'vi' ? 'Đã nạp dữ liệu mẫu thành công!' : 'Sample data loaded successfully!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-800 to-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-amber-400" />
            <h3 className="font-extrabold text-base tracking-wide uppercase">
              {t.settingsTitle}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* AUDIO & ANNOUNCEMENT SETTINGS */}
          <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-amber-700" />
                <span className="font-extrabold text-amber-950 uppercase">
                  {t.audioConfigTitle}
                </span>
              </div>
              <label className="flex items-center gap-2 cursor-pointer font-bold text-amber-900">
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => setSoundEnabled(e.target.checked)}
                  className="rounded text-red-700 w-4 h-4"
                />
                <span>{t.enableSound}</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>{t.voiceVolumeLabel}</span>
                  <span className="font-mono">{Math.round(voiceVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={voiceVolume}
                  onChange={(e) => setVoiceVolume(parseFloat(e.target.value))}
                  className="w-full accent-red-700 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>{t.voiceRateLabel}</span>
                  <span className="font-mono">{voiceRate}x</span>
                </div>
                <input
                  type="range"
                  min="0.75"
                  max="1.25"
                  step="0.05"
                  value={voiceRate}
                  onChange={(e) => setVoiceRate(parseFloat(e.target.value))}
                  className="w-full accent-red-700 cursor-pointer"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleTestAudio}
              className="py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer w-full shadow-xs"
            >
              <Volume2 className="w-4 h-4" />
              <span>{t.btnTestVoiceFull}</span>
            </button>
          </div>

          {/* CENTER INFORMATION SETTINGS */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Building className="w-4 h-4 text-slate-500" />
              {t.centerInfoTitle}
            </h4>

            <div>
              <label className="block font-bold text-slate-700 mb-1 uppercase">
                {t.labelCenterName}
              </label>
              <input
                type="text"
                value={centerName}
                onChange={(e) => setCenterName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 uppercase">
                {t.labelSubtitle}
              </label>
              <input
                type="text"
                value={subTitle}
                onChange={(e) => setSubTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-700 outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase">
                  {t.labelAddress}
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-700 outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase">
                  {t.labelHotline}
                </label>
                <input
                  type="text"
                  value={hotline}
                  onChange={(e) => setHotline(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-slate-700 outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>
            </div>
          </div>

          {/* DATA RESET & SAMPLE DATA */}
          <div className="border-t border-slate-200 pt-4 space-y-2">
            <h4 className="font-extrabold text-slate-800 uppercase tracking-wider">
              {t.dataMgmtTitle}
            </h4>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={handleResetConfirm}
                className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t.btnResetQueue}</span>
              </button>
              <button
                type="button"
                onClick={handleSeedConfirm}
                className="flex-1 py-2.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-blue-200"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{t.btnReloadSample}</span>
              </button>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="pt-2 flex items-center justify-between">
            {savedSuccess ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> {t.savedSuccessText}
              </span>
            ) : <span></span>}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
              >
                {t.btnClose}
              </button>
              <button
                type="submit"
                className="py-2.5 px-5 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Save className="w-4 h-4" />
                <span>{t.btnSaveSettings}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
