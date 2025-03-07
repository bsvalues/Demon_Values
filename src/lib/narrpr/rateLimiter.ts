interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface RateLimitState {
  requests: number;
  resetTime: number;
}

export class RateLimiter {
  private config: RateLimitConfig;
  private state: RateLimitState;
  private queue: Array<() => Promise<void>>;
  private processing: boolean;

  constructor(config: Partial<RateLimitConfig> = {}) {
    this.config = {
      maxRequests: 100, // requests per window
      windowMs: 60000,  // 1 minute window
      ...config,
    };

    this.state = {
      requests: 0,
      resetTime: Date.now() + this.config.windowMs,
    };

    this.queue = [];
    this.processing = false;
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Reset counter if window has expired
    if (Date.now() >= this.state.resetTime) {
      this.state.requests = 0;
      this.state.resetTime = Date.now() + this.config.windowMs;
    }

    // Check if we're at the limit
    if (this.state.requests >= this.config.maxRequests) {
      // Queue the request
      return new Promise((resolve, reject) => {
        this.queue.push(async () => {
          try {
            const result = await fn();
            resolve(result);
          } catch (error) {
            reject(error);
          }
        });

        if (!this.processing) {
          this.processQueue();
        }
      });
    }

    // Execute immediately if under limit
    this.state.requests++;
    return fn();
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;

    while (this.queue.length > 0) {
      // Wait for next window if needed
      if (this.state.requests >= this.config.maxRequests) {
        const waitTime = this.state.resetTime - Date.now();
        await new Promise(resolve => setTimeout(resolve, waitTime));
        this.state.requests = 0;
        this.state.resetTime = Date.now() + this.config.windowMs;
      }

      const request = this.queue.shift();
      if (request) {
        this.state.requests++;
        try {
          await request();
        } catch (error) {
          console.error('Queued request failed:', error);
        }
      }
    }

    this.processing = false;
  }

  getStatus() {
    return {
      remainingRequests: this.config.maxRequests - this.state.requests,
      resetIn: this.state.resetTime - Date.now(),
      queueLength: this.queue.length,
    };
  }
}