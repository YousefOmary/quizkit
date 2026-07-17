/** One gesture-gated procedural Web Audio graph shared by every screen. */
export class AudioCore {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private reverb: GainNode | null = null;
  private ambient: OscillatorNode[] = [];
  private soundOn = true;
  private musicOn = false;
  /** Apply persisted preferences; ambient begins only after a gesture unlock. */
  setPreferences(sound: boolean, music: boolean): void {
    this.soundOn = sound;
    this.musicOn = music;
    if (this.master) this.master.gain.setTargetAtTime(sound ? 0.7 : 0, this.now(), 0.02);
    if (music && this.context) this.startAmbient();
    else this.stopAmbient();
  }
  /** Create/resume the graph after a player gesture. Safe to repeat. */
  async unlock(): Promise<void> {
    if (!this.context) this.buildGraph();
    if (this.context?.state === 'suspended') await this.context.resume();
    if (this.musicOn) this.startAmbient();
  }
  /** A soft UI tap. */
  tap(): void {
    this.tone(280, 0.035, 0.025, 'sine');
  }
  /** Rising correct chord whose top note follows the current combo. */
  correct(streak: number): void {
    const lift = Math.min(streak, 5) * 18;
    this.tone(520 + lift, 0.18, 0.05, 'sine', 0);
    this.tone(660 + lift, 0.22, 0.04, 'triangle', 0.045);
    this.tone(790 + lift, 0.28, 0.035, 'sine', 0.085, true);
  }
  /** Short low buzz for an incorrect answer. */
  wrong(): void {
    this.tone(150, 0.24, 0.055, 'sawtooth', 0, true, 92);
    this.noise(0.12, 0.018);
  }
  /** Restrained countdown tick, stronger in the last three seconds. */
  tick(urgent: boolean): void {
    this.tone(urgent ? 880 : 620, urgent ? 0.06 : 0.025, urgent ? 0.025 : 0.012, 'square');
  }
  /** Bright milestone sparkle. */
  milestone(): void {
    [740, 920, 1180].forEach((hz, index) => this.tone(hz, 0.18, 0.03, 'sine', index * 0.055, true));
  }
  /** Layered finish fanfare. */
  complete(): void {
    [392, 523, 659, 784].forEach((hz, index) => this.tone(hz, 0.45, 0.045, 'triangle', index * 0.1, true));
    this.tone(1047, 0.65, 0.035, 'sine', 0.42, true);
  }
  private buildGraph(): void {
    const AudioCtor = window.AudioContext ?? window.webkitAudioContext;
    if (!AudioCtor) return;
    const context = new AudioCtor();
    const master = context.createGain();
    const limiter = context.createDynamicsCompressor();
    limiter.threshold.value = -12;
    limiter.knee.value = 8;
    limiter.ratio.value = 12;
    limiter.attack.value = 0.003;
    limiter.release.value = 0.18;
    master.gain.value = this.soundOn ? 0.7 : 0;
    master.connect(limiter).connect(context.destination);
    const convolver = context.createConvolver();
    convolver.buffer = this.impulse(context);
    const reverb = context.createGain();
    reverb.gain.value = 0.16;
    reverb.connect(convolver).connect(master);
    this.context = context;
    this.master = master;
    this.reverb = reverb;
  }
  private impulse(context: AudioContext): AudioBuffer {
    const length = Math.floor(context.sampleRate * 0.8);
    const buffer = context.createBuffer(2, length, context.sampleRate);
    for (let channel = 0; channel < 2; channel += 1) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** 2.8;
    }
    return buffer;
  }
  private tone(
    hz: number, duration: number, volume: number, type: OscillatorType,
    delay = 0, wet = false, endHz = hz,
  ): void {
    const context = this.context;
    if (!context || !this.master || !this.soundOn) return;
    const start = context.currentTime + delay;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(hz, start);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(endHz, 1), start + duration);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain).connect(this.master);
    if (wet && this.reverb) gain.connect(this.reverb);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
  }
  private noise(duration: number, volume: number): void {
    const context = this.context;
    if (!context || !this.master || !this.soundOn) return;
    const buffer = context.createBuffer(1, Math.floor(context.sampleRate * duration), context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let index = 0; index < data.length; index += 1) data[index] = Math.random() * 2 - 1;
    const source = context.createBufferSource();
    const gain = context.createGain();
    gain.gain.value = volume;
    source.buffer = buffer;
    source.connect(gain).connect(this.master);
    source.start();
  }
  private startAmbient(): void {
    if (!this.context || !this.master || this.ambient.length || !this.soundOn) return;
    this.ambient = [110, 164.81].map((frequency) => {
      const oscillator = this.context!.createOscillator();
      const gain = this.context!.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      gain.gain.value = 0.009;
      oscillator.connect(gain).connect(this.master!);
      oscillator.start();
      return oscillator;
    });
  }
  private stopAmbient(): void {
    this.ambient.forEach((oscillator) => oscillator.stop());
    this.ambient = [];
  }
  private now(): number {
    return this.context?.currentTime ?? 0;
  }
}
declare global {
  interface Window { webkitAudioContext?: typeof AudioContext }
}
/** Shared application audio core. */
export const audio = new AudioCore();
