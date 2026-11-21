class SoundEngine {
  private ctx: AudioContext | null = null;
  private muted = false;

  public isMuted(): boolean {
    return this.muted;
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
  }

  private getContext(): AudioContext | null {
    if (this.muted || typeof window === 'undefined') return null;
    try {
      if (!this.ctx) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext;
        if (!AudioCtx) return null;
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === 'suspended') {
        void this.ctx.resume();
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  private playTone(
    freq: number,
    startOffset: number,
    duration: number,
    type: OscillatorType = 'triangle',
    gainPeak = 0.14
  ): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime + startOffset;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(gainPeak, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  public playClick(): void {
    this.playTone(480, 0, 0.06, 'sine', 0.07);
  }

  public playHint(): void {
    this.playTone(587.33, 0, 0.12, 'triangle', 0.09);
    this.playTone(880, 0.07, 0.16, 'triangle', 0.08);
  }

  public playCorrect(streak = 1): void {
    const pitchBoost = Math.min(streak - 1, 5) * 22;
    this.playTone(523.25 + pitchBoost, 0, 0.14, 'triangle', 0.13);
    this.playTone(659.25 + pitchBoost, 0.07, 0.16, 'triangle', 0.13);
    this.playTone(783.99 + pitchBoost, 0.14, 0.24, 'triangle', 0.14);
  }

  public playWrong(): void {
    this.playTone(260, 0, 0.14, 'sine', 0.11);
    this.playTone(210, 0.11, 0.2, 'sine', 0.1);
  }

  public playVictory(): void {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, idx) => {
      this.playTone(n, idx * 0.09, 0.28, 'triangle', 0.14);
    });
  }

  public playGameOver(): void {
    const notes = [392.0, 349.23, 311.13, 261.63];
    notes.forEach((n, idx) => {
      this.playTone(n, idx * 0.12, 0.25, 'sine', 0.11);
    });
  }
}

export const soundEngine = new SoundEngine();
