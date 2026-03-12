export class AudioManager {
  private ctx: AudioContext | null = null;
  private windGain: GainNode | null = null;
  private windFilter: BiquadFilterNode | null = null;
  private carveGain: GainNode | null = null;
  private initialized = false;

  init() {
    if (this.initialized) return;
    try {
      this.ctx = new AudioContext();
      this.setupWind();
      this.setupCarve();
      this.initialized = true;
    } catch {
      // Audio not available
    }
  }

  private setupWind() {
    if (!this.ctx) return;
    const bufferSize = 2 * this.ctx.sampleRate;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    this.windFilter = this.ctx.createBiquadFilter();
    this.windFilter.type = "bandpass";
    this.windFilter.frequency.value = 300;
    this.windFilter.Q.value = 0.5;

    this.windGain = this.ctx.createGain();
    this.windGain.gain.value = 0;

    noise.connect(this.windFilter);
    this.windFilter.connect(this.windGain);
    this.windGain.connect(this.ctx.destination);
    noise.start();
  }

  private setupCarve() {
    if (!this.ctx) return;
    const bufferSize = 2 * this.ctx.sampleRate;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 3000;
    filter.Q.value = 1;

    this.carveGain = this.ctx.createGain();
    this.carveGain.gain.value = 0;

    noise.connect(filter);
    filter.connect(this.carveGain);
    this.carveGain.connect(this.ctx.destination);
    noise.start();
  }

  update(speed: number, maxSpeed: number, turnAmount: number, isAirborne: boolean) {
    if (!this.ctx) return;

    // Wind — louder and higher-pitched at speed
    if (this.windGain && this.windFilter) {
      const ratio = speed / maxSpeed;
      this.windGain.gain.setTargetAtTime(ratio * 0.1, this.ctx.currentTime, 0.1);
      this.windFilter.frequency.setTargetAtTime(
        200 + ratio * 600,
        this.ctx.currentTime,
        0.1
      );
    }

    // Carve — activates on hard turns at speed (not while airborne)
    if (this.carveGain) {
      if (isAirborne) {
        this.carveGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
      } else {
        const intensity = Math.abs(turnAmount) * Math.min(1, speed / 5);
        const volume = intensity > 0.3 ? (intensity - 0.3) * 0.06 : 0;
        this.carveGain.gain.setTargetAtTime(volume, this.ctx.currentTime, 0.05);
      }
    }
  }

  playCrash() {
    if (!this.ctx) return;
    const duration = 0.3;
    const bufferSize = Math.ceil(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 800;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      this.ctx.currentTime + duration
    );

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    source.start();
    source.stop(this.ctx.currentTime + duration);
  }

  playLodgeEnter() {
    if (!this.ctx) return;
    this.playTone(880, 0.15, 0.06);
    setTimeout(() => this.playTone(1320, 0.2, 0.05), 120);
  }

  playJumpLaunch() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(300, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.2);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.07, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }

  playJumpLand() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(80, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.15);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }

  stopWind() {
    if (!this.ctx) return;
    if (this.windGain) {
      this.windGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
    }
    if (this.carveGain) {
      this.carveGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
    }
  }

  private playTone(freq: number, duration: number, volume: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      this.ctx.currentTime + duration
    );
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }
}
