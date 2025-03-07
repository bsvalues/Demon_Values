import { BehaviorSubject } from 'rxjs';

interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  apiLatency: number;
  renderTime: number;
}

class PerformanceMonitor {
  private metrics$ = new BehaviorSubject<PerformanceMetrics>({
    fps: 0,
    memoryUsage: 0,
    apiLatency: 0,
    renderTime: 0
  });

  private lastFrameTime = performance.now();
  private frameCount = 0;

  constructor() {
    this.startMonitoring();
  }

  private startMonitoring() {
    // Monitor FPS
    const measureFPS = () => {
      const now = performance.now();
      const delta = now - this.lastFrameTime;
      this.frameCount++;

      if (delta >= 1000) {
        const fps = Math.round((this.frameCount * 1000) / delta);
        this.updateMetrics({ fps });
        this.frameCount = 0;
        this.lastFrameTime = now;
      }

      requestAnimationFrame(measureFPS);
    };

    requestAnimationFrame(measureFPS);

    // Monitor memory usage
    setInterval(() => {
      const memory = (performance as any).memory;
      if (memory) {
        this.updateMetrics({
          memoryUsage: Math.round(memory.usedJSHeapSize / (1024 * 1024))
        });
      }
    }, 2000);
  }

  trackApiCall(startTime: number) {
    const latency = performance.now() - startTime;
    this.updateMetrics({ apiLatency: Math.round(latency) });
  }

  trackRender(component: string, duration: number) {
    this.updateMetrics({ renderTime: Math.round(duration) });
  }

  private updateMetrics(update: Partial<PerformanceMetrics>) {
    this.metrics$.next({
      ...this.metrics$.value,
      ...update
    });
  }

  getMetrics() {
    return this.metrics$.asObservable();
  }
}

export const performanceMonitor = new PerformanceMonitor();