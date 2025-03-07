import { eventManager } from './events';

interface TimeExtent {
  start: Date;
  end: Date;
}

interface TimeAwareLayer {
  layerId: string;
  timeField: string;
  startField?: string;
  endField?: string;
  timeExtent: TimeExtent;
  resolution: 'years' | 'months' | 'days' | 'hours';
}

export class TemporalManager {
  private timeAwareLayers = new Map<string, TimeAwareLayer>();
  private currentTime: Date = new Date();
  private playing = false;
  private playbackSpeed = 1;
  private animationFrame: number | null = null;

  enableTimeAwareness(config: TimeAwareLayer): void {
    this.timeAwareLayers.set(config.layerId, config);
    this.emitTimeUpdate(config.layerId);
  }

  setCurrentTime(time: Date): void {
    this.currentTime = time;
    this.emitTimeUpdates();
  }

  play(speed: number = 1): void {
    this.playbackSpeed = speed;
    this.playing = true;
    this.animate();
  }

  pause(): void {
    this.playing = false;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  private animate(): void {
    let lastTime = performance.now();

    const step = (currentTime: number) => {
      if (!this.playing) return;

      const deltaTime = currentTime - lastTime;
      this.advanceTime(deltaTime * this.playbackSpeed);
      lastTime = currentTime;

      this.animationFrame = requestAnimationFrame(step);
    };

    this.animationFrame = requestAnimationFrame(step);
  }

  private advanceTime(deltaMs: number): void {
    this.currentTime = new Date(this.currentTime.getTime() + deltaMs);
    this.emitTimeUpdates();
  }

  private emitTimeUpdates(): void {
    this.timeAwareLayers.forEach((layer, layerId) => {
      this.emitTimeUpdate(layerId);
    });
  }

  private emitTimeUpdate(layerId: string): void {
    const layer = this.timeAwareLayers.get(layerId);
    if (!layer) return;

    eventManager.emit({
      type: 'update',
      layerId,
      timestamp: Date.now(),
      data: {
        action: 'time-update',
        time: this.currentTime,
        timeExtent: layer.timeExtent
      }
    });
  }

  getTimeAwareLayer(layerId: string): TimeAwareLayer | undefined {
    return this.timeAwareLayers.get(layerId);
  }

  getCurrentTime(): Date {
    return new Date(this.currentTime);
  }
}

export const temporalManager = new TemporalManager();