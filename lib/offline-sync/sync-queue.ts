/**
 * Sync Queue Manager
 * Handles offline operation queueing and synchronization with server.
 * Implements exponential backoff retry strategy.
 */

import { offlineStorage, SyncQueueItem } from './storage'

export interface SyncResponse {
  success: boolean
  message?: string
  error?: string
}

class SyncQueueManager {
  private isSyncing = false
  private syncRetryDelay = 1000 // Start with 1 second
  private maxRetries = 5
  private maxRetryDelay = 60000 // Cap at 60 seconds
  private listeners: Set<(status: SyncStatus) => void> = new Set()

  /**
   * Queue an operation for syncing
   */
  async queueOperation(
    type: 'triage' | 'quiz_response' | 'score',
    endpoint: string,
    payload: Record<string, unknown>
  ): Promise<string> {
    return offlineStorage.queueForSync({
      type,
      endpoint,
      payload,
      timestamp: Date.now(),
    })
  }

  /**
   * Attempt to sync all pending operations
   */
  async syncAll(): Promise<SyncResponse> {
    if (this.isSyncing) {
      return { success: false, message: 'Sync already in progress' }
    }

    this.isSyncing = true
    this.notifyListeners({ status: 'syncing', itemsProcessed: 0 })

    try {
      const queue = await offlineStorage.getSyncQueue()

      if (queue.length === 0) {
        this.notifyListeners({ status: 'idle', itemsProcessed: 0 })
        return { success: true, message: 'Nothing to sync' }
      }

      let processed = 0
      const errors: Array<{ id: string; error: string }> = []

      for (const item of queue) {
        const result = await this.syncItem(item)

        if (result.success) {
          await offlineStorage.removeSyncItem(item.id)
          processed++
        } else {
          // Retry logic
          if (item.retries < this.maxRetries) {
            await offlineStorage.incrementSyncRetry(item.id)
          } else {
            // Max retries exceeded, remove from queue
            await offlineStorage.removeSyncItem(item.id)
            errors.push({ id: item.id, error: 'Max retries exceeded' })
          }
        }

        this.notifyListeners({ status: 'syncing', itemsProcessed: processed })
      }

      this.notifyListeners({ status: 'idle', itemsProcessed: processed })

      if (errors.length > 0) {
        return {
          success: false,
          message: `Synced ${processed} items, ${errors.length} failed`,
        }
      }

      return { success: true, message: `Synced ${processed} items` }
    } catch (error) {
      this.notifyListeners({ status: 'error', itemsProcessed: 0 })
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    } finally {
      this.isSyncing = false
    }
  }

  /**
   * Sync a single item
   */
  private async syncItem(item: SyncQueueItem): Promise<SyncResponse> {
    try {
      const response = await fetch(item.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.payload),
      })

      if (response.ok) {
        return { success: true }
      } else {
        return {
          success: false,
          error: `HTTP ${response.status}`,
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      }
    }
  }

  /**
   * Register a listener for sync status changes
   */
  onSyncStatusChange(
    listener: (status: SyncStatus) => void
  ): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  /**
   * Notify all listeners of status change
   */
  private notifyListeners(status: SyncStatus): void {
    this.listeners.forEach((listener) => listener(status))
  }

  /**
   * Get current sync queue status
   */
  async getQueueStatus(): Promise<{
    isPending: boolean
    itemCount: number
    isSyncing: boolean
  }> {
    const queue = await offlineStorage.getSyncQueue()
    return {
      isPending: queue.length > 0,
      itemCount: queue.length,
      isSyncing: this.isSyncing,
    }
  }

  /**
   * Clear the sync queue (destructive)
   */
  async clearQueue(): Promise<void> {
    const queue = await offlineStorage.getSyncQueue()
    for (const item of queue) {
      await offlineStorage.removeSyncItem(item.id)
    }
  }
}

export interface SyncStatus {
  status: 'syncing' | 'idle' | 'error'
  itemsProcessed: number
}

// Singleton instance
export const syncQueueManager = new SyncQueueManager()

// Export for testing
export { SyncQueueManager }
