/**
 * Audio Chime and Voice Announcement Service for Queue Calling
 * Uses Web Audio API for offline crystal-clear chime and Web Speech API for Vietnamese speech.
 */

class SoundService {
  private audioCtx: AudioContext | null = null;
  private isSpeechActive: boolean = false;

  private initAudio() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  /**
   * Plays a high quality 3-tone airport/administrative queue chime:
   * Notes: F5 (698.46Hz) -> A5 (880Hz) -> C6 (1046.5Hz)
   */
  public playChime(volume: number = 0.8): Promise<void> {
    return new Promise((resolve) => {
      try {
        this.initAudio();
        if (!this.audioCtx) {
          resolve();
          return;
        }

        const ctx = this.audioCtx;
        const now = ctx.currentTime;
        const notes = [
          { freq: 587.33, start: 0, duration: 0.35 },    // D5
          { freq: 739.99, start: 0.28, duration: 0.35 }, // F#5
          { freq: 880.00, start: 0.55, duration: 0.65 }  // A5
        ];

        notes.forEach((note) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(note.freq, now + note.start);

          // Attack and exponential decay
          gain.gain.setValueAtTime(0.0001, now + note.start);
          gain.gain.linearRampToValueAtTime(volume * 0.4, now + note.start + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + note.start + note.duration);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + note.start);
          osc.stop(now + note.start + note.duration + 0.05);
        });

        // Resolve after chime completes
        setTimeout(() => {
          resolve();
        }, 1100);
      } catch (err) {
        console.warn('Audio chime playback error:', err);
        resolve();
      }
    });
  }

  /**
   * Speak announcement in Vietnamese:
   * e.g. "Xin mời công dân số thứ tự A 1 0 2, đến quầy số 3"
   */
  public async announce(
    ticketNumber: string,
    counterName: string,
    options?: { volume?: number; rate?: number; pitch?: number }
  ): Promise<void> {
    const vol = options?.volume ?? 1;
    const rate = options?.rate ?? 0.92;
    const pitch = options?.pitch ?? 1.0;

    // First play pleasant chime
    await this.playChime(vol);

    if (!('speechSynthesis' in window)) {
      return;
    }

    try {
      window.speechSynthesis.cancel(); // Stop any pending speech

      // Format ticket number for clear pronunciation: "A - 1 0 2" -> "A, một không hai"
      const formattedTicket = ticketNumber
        .replace('-', ' ')
        .split('')
        .join(' ');

      const text = `Xin mời công dân có số thứ tự ${formattedTicket}, đến ${counterName} để thực hiện thủ tục.`;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'vi-VN';
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = vol;

      // Find Vietnamese voice if available
      const voices = window.speechSynthesis.getVoices();
      const viVoice = voices.find(v => v.lang.startsWith('vi') || v.lang.includes('VN'));
      if (viVoice) {
        utterance.voice = viVoice;
      }

      this.isSpeechActive = true;
      utterance.onend = () => {
        this.isSpeechActive = false;
      };
      utterance.onerror = () => {
        this.isSpeechActive = false;
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
      this.isSpeechActive = false;
    }
  }

  public testVoice() {
    this.announce('A-102', 'Quầy số 01');
  }
}

export const soundService = new SoundService();
