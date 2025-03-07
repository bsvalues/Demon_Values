import { supabase } from '../supabase';

interface NARRPRData {
  title: string;
  date: string;
  value?: number;
  address?: string;
}

interface SyncStatus {
  inProgress: boolean;
  lastSync: Date | null;
  error: string | null;
  data: NARRPRData[] | null;
}

class NARRPRBridge {
  private status: SyncStatus = {
    inProgress: false,
    lastSync: null,
    error: null,
    data: null
  };

  async triggerSync(): Promise<void> {
    if (this.status.inProgress) {
      throw new Error('Sync already in progress');
    }

    this.status.inProgress = true;
    this.status.error = null;

    try {
      // Call Python script via API endpoint
      const response = await fetch('/api/narrpr/sync', {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to sync with NARRPR');
      }

      const data = await response.json();
      
      // Save to Supabase
      const { error } = await supabase
        .from('properties')
        .upsert(data.map((item: NARRPRData) => ({
          title: item.title,
          date: item.date,
          value: item.value,
          address: item.address
        })));

      if (error) throw error;

      this.status.lastSync = new Date();
      this.status.data = data;
    } catch (error) {
      this.status.error = error instanceof Error ? error.message : 'Unknown error';
      throw error;
    } finally {
      this.status.inProgress = false;
    }
  }

  getStatus(): SyncStatus {
    return { ...this.status };
  }
}

export const narrprBridge = new NARRPRBridge();