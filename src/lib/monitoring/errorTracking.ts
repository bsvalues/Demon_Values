import { BehaviorSubject } from 'rxjs';

interface ErrorEvent {
  id: string;
  timestamp: number;
  type: string;
  message: string;
  stack?: string;
  componentName?: string;
  context?: Record<string, any>;
}

interface ErrorMetrics {
  total: number;
  categories: Record<string, number>;
  recentErrors: ErrorEvent[];
  trends: {
    hourly: number;
    daily: number;
  };
}

class ErrorTracker {
  private errors$ = new BehaviorSubject<ErrorMetrics>({
    total: 0,
    categories: {},
    recentErrors: [],
    trends: { hourly: 0, daily: 0 }
  });

  private errorLog: ErrorEvent[] = [];
  private readonly maxLogSize = 1000;
  private readonly maxRecentErrors = 10;

  trackError(error: Error, context?: { componentName?: string; [key: string]: any }) {
    const errorEvent: ErrorEvent = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      type: error.constructor.name,
      message: error.message,
      stack: error.stack,
      ...context
    };

    this.errorLog.unshift(errorEvent);
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.pop();
    }

    this.updateMetrics();
    this.logError(errorEvent);
  }

  private updateMetrics() {
    const now = Date.now();
    const hourAgo = now - 3600000;
    const dayAgo = now - 86400000;

    const categories: Record<string, number> = {};
    const hourlyErrors = this.errorLog.filter(e => e.timestamp > hourAgo).length;
    const dailyErrors = this.errorLog.filter(e => e.timestamp > dayAgo).length;

    this.errorLog.forEach(error => {
      categories[error.type] = (categories[error.type] || 0) + 1;
    });

    this.errors$.next({
      total: this.errorLog.length,
      categories,
      recentErrors: this.errorLog.slice(0, this.maxRecentErrors),
      trends: {
        hourly: hourlyErrors,
        daily: dailyErrors
      }
    });
  }

  private logError(error: ErrorEvent) {
    console.error(
      `[${new Date(error.timestamp).toISOString()}] ${error.type}: ${error.message}`,
      {
        componentName: error.componentName,
        context: error.context,
        stack: error.stack
      }
    );
  }

  getMetrics() {
    return this.errors$.asObservable();
  }

  clearErrors() {
    this.errorLog = [];
    this.updateMetrics();
  }
}

export const errorTracker = new ErrorTracker();