import { NARRPRClient } from './client';

interface SchedulerConfig {
  interval: number; // Minutes between syncs
  retryAttempts: number;
  retryDelay: number; // Milliseconds between retries
}

export class NARRPRScheduler {
  private timer: number | null = null;
  private client: NARRPRClient;
  private config: SchedulerConfig;
  private lastSync: Date | null = null;
  private syncInProgress = false;
  private retryCount = 0;

  constructor(client: NARRPRClient, config: Partial<SchedulerConfig> = {}) {
    this.client = client;
    this.config = {
      interval: 60, // Default to hourly syncs
      retryAttempts: 3,
      retryDelay: 5000, // 5 seconds
      ...config
    };
  }

  start() {
    if (this.timer) {
      console.warn('Scheduler already running');
      return;
    }

    // Initial sync
    this.sync();

    // Schedule recurring syncs
    this.timer = window.setInterval(() => {
      this.sync();
    }, this.config.interval * 60 * 1000);

    console.log(`NARRPR sync scheduled every ${this.config.interval} minutes`);
  }

  stop() {
    if (this.timer) {
      window.clearInterval(this.timer);
      this.timer = null;
      console.log('NARRPR sync scheduler stopped');
    }
  }

  getStatus() {
    return {
      running: this.timer !== null,
      lastSync: this.lastSync,
      syncInProgress: this.syncInProgress,
      nextSync: this.timer 
        ? new Date(Date.now() + this.config.interval * 60 * 1000)
        : null
    };
  }

  private async sync() {
    if (this.syncInProgress) {
      console.warn('Sync already in progress, skipping');
      return;
    }

    this.syncInProgress = true;
    this.retryCount = 0;

    try {
      await this.attemptSync();
      this.lastSync = new Date();
      this.retryCount = 0;
    } catch (error) {
      console.error('Sync failed:', error);
      await this.handleSyncError();
    } finally {
      this.syncInProgress = false;
    }
  }

  private async attemptSync() {
    const loggedIn = await this.client.login();
    if (!loggedIn) {
      throw new Error('Failed to login to NARRPR');
    }

    await this.client.syncWithDatabase();
  }

  private async handleSyncError() {
    if (this.retryCount < this.config.retryAttempts) {
      this.retryCount++;
      console.log(`Retrying sync (attempt ${this.retryCount}/${this.config.retryAttempts})...`);
      
      await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
      await this.sync();
    } else {
      console.error('Max retry attempts reached');
      // You could implement error reporting here
    }
  }
}