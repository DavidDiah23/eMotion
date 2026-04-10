import { supabase } from '../app/client';
import { toast } from 'sonner';

interface QueueItem {
  id: string;
  payload: any;
  endpoint: string;
  timestamp: number;
}

class OfflineQueueManager {
  private queueKey = 'eMotion_offlineQueue';

  constructor() {
    window.addEventListener('online', this.flushQueue.bind(this));
  }

  enqueue(endpoint: string, payload: any) {
    const item: QueueItem = {
      id: crypto.randomUUID(),
      endpoint,
      payload,
      timestamp: Date.now()
    };
    
    const queue = this.getQueue();
    queue.push(item);
    localStorage.setItem(this.queueKey, JSON.stringify(queue));
    toast.info('Offline: Alert queued for sync when signal returns.');
  }

  private getQueue(): QueueItem[] {
    const raw = localStorage.getItem(this.queueKey);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  async flushQueue() {
    const queue = this.getQueue();
    if (queue.length === 0) return;

    toast.info(`Signal restored! Syncing ${queue.length} offline events...`);
    
    // Process items
    const failedItems: QueueItem[] = [];

    for (const item of queue) {
      try {
        if (item.endpoint === 'notify_emergency') {
          await supabase.rpc('notify_emergency', item.payload);
        }
        // Could add more endpoints here
      } catch (err) {
        console.error(`Failed to sync queued item ${item.id}`, err);
        failedItems.push(item);
      }
    }

    localStorage.setItem(this.queueKey, JSON.stringify(failedItems));
    
    if (failedItems.length === 0) {
      toast.success('All offline data synchronized successfully.');
    }
  }

  // Wrapper for Supabase RPCs designed for offline capabilities
  async safeRpc(endpoint: string, payload: any) {
    if (navigator.onLine) {
      try {
        const { error } = await supabase.rpc(endpoint, payload);
        if (error) throw error;
        return true;
      } catch (error) {
         console.warn(`RPC ${endpoint} failed online, queueing...`, error);
         this.enqueue(endpoint, payload);
         return false;
      }
    } else {
      this.enqueue(endpoint, payload);
      return false;
    }
  }
}

export const offlineQueue = new OfflineQueueManager();
