import { eventManager } from './events';

interface AnimationFrame {
  timestamp: number;
  properties: Record<string, any>;
}

interface Animation {
  id: string;
  layerId: string;
  frames: AnimationFrame[];
  duration: number;
  loop: boolean;
  playing: boolean;
  currentFrame: number;
}

export class AnimationManager {
  private animations = new Map<string, Animation>();
  private animationFrame: number | null = null;

  createAnimation(layerId: string, frames: AnimationFrame[], options: {
    duration?: number;
    loop?: boolean;
  } = {}): string {
    const id = crypto.randomUUID();
    this.animations.set(id, {
      id,
      layerId,
      frames,
      duration: options.duration || 5000,
      loop: options.loop || false,
      playing: false,
      currentFrame: 0
    });
    return id;
  }

  play(animationId: string): void {
    const animation = this.animations.get(animationId);
    if (animation && !animation.playing) {
      animation.playing = true;
      this.startAnimation(animation);
    }
  }

  pause(animationId: string): void {
    const animation = this.animations.get(animationId);
    if (animation) {
      animation.playing = false;
      if (this.animationFrame) {
        cancelAnimationFrame(this.animationFrame);
        this.animationFrame = null;
      }
    }
  }

  stop(animationId: string): void {
    const animation = this.animations.get(animationId);
    if (animation) {
      animation.playing = false;
      animation.currentFrame = 0;
      if (this.animationFrame) {
        cancelAnimationFrame(this.animationFrame);
        this.animationFrame = null;
      }
    }
  }

  private startAnimation(animation: Animation): void {
    let lastTime = performance.now();
    const frameInterval = animation.duration / animation.frames.length;

    const animate = (currentTime: number) => {
      if (!animation.playing) return;

      const deltaTime = currentTime - lastTime;
      if (deltaTime >= frameInterval) {
        this.updateFrame(animation);
        lastTime = currentTime;
      }

      this.animationFrame = requestAnimationFrame(animate);
    };

    this.animationFrame = requestAnimationFrame(animate);
  }

  private updateFrame(animation: Animation): void {
    const frame = animation.frames[animation.currentFrame];
    
    eventManager.emit({
      type: 'update',
      layerId: animation.layerId,
      timestamp: Date.now(),
      data: {
        action: 'animation-frame',
        properties: frame.properties
      }
    });

    animation.currentFrame++;
    if (animation.currentFrame >= animation.frames.length) {
      if (animation.loop) {
        animation.currentFrame = 0;
      } else {
        animation.playing = false;
      }
    }
  }

  removeAnimation(animationId: string): void {
    const animation = this.animations.get(animationId);
    if (animation) {
      this.stop(animationId);
      this.animations.delete(animationId);
    }
  }
}

export const animationManager = new AnimationManager();