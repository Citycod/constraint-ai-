/**
 * IndexedDB Storage Layer
 * Handles offline data persistence with simple CRUD operations.
 * Schema: sessions, quizzes, responses, syncQueue
 */

const DB_NAME = 'edge-ai-system'
const DB_VERSION = 1

export interface StorageSession {
  id: string
  type: 'healthcare' | 'education'
  createdAt: number
  updatedAt: number
  data: Record<string, unknown>
}

export interface StorageQuiz {
  id: string
  sessionId: string
  categoryId: string
  startTime: number
  endTime?: number
  score?: number
  data: Record<string, unknown>
}

export interface StorageResponse {
  id: string
  sessionId: string
  quizId?: string
  questionId: string
  answer: string
  correct: boolean
  timestamp: number
  difficulty?: 'easy' | 'medium' | 'hard'
}

export interface SyncQueueItem {
  id: string
  type: 'triage' | 'quiz_response' | 'score'
  endpoint: string
  payload: Record<string, unknown>
  timestamp: number
  retries: number
}

class OfflineStorage {
  private db: IDBDatabase | null = null
  private dbPromise: Promise<IDBDatabase> | null = null

  /**
   * Initialize IndexedDB connection
   */
  async init(): Promise<void> {
    if (this.db) return
    if (this.dbPromise) {
      this.db = await this.dbPromise
      return
    }

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve(request.result)
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create object stores
        if (!db.objectStoreNames.contains('sessions')) {
          db.createObjectStore('sessions', { keyPath: 'id' })
        }

        if (!db.objectStoreNames.contains('quizzes')) {
          const quizStore = db.createObjectStore('quizzes', { keyPath: 'id' })
          quizStore.createIndex('sessionId', 'sessionId', { unique: false })
        }

        if (!db.objectStoreNames.contains('responses')) {
          const responseStore = db.createObjectStore('responses', {
            keyPath: 'id',
          })
          responseStore.createIndex('sessionId', 'sessionId', { unique: false })
          responseStore.createIndex('quizId', 'quizId', { unique: false })
        }

        if (!db.objectStoreNames.contains('syncQueue')) {
          const queueStore = db.createObjectStore('syncQueue', {
            keyPath: 'id',
          })
          queueStore.createIndex('timestamp', 'timestamp', { unique: false })
        }
      }
    })

    this.db = await this.dbPromise
  }

  /**
   * Save a session
   */
  async saveSession(session: StorageSession): Promise<void> {
    await this.init()
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['sessions'], 'readwrite')
      const store = transaction.objectStore('sessions')
      const request = store.put(session)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  /**
   * Get a session by ID
   */
  async getSession(id: string): Promise<StorageSession | null> {
    await this.init()
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['sessions'], 'readonly')
      const store = transaction.objectStore('sessions')
      const request = store.get(id)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result || null)
    })
  }

  /**
   * Save a quiz
   */
  async saveQuiz(quiz: StorageQuiz): Promise<void> {
    await this.init()
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['quizzes'], 'readwrite')
      const store = transaction.objectStore('quizzes')
      const request = store.put(quiz)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  /**
   * Get all quizzes for a session
   */
  async getSessionQuizzes(sessionId: string): Promise<StorageQuiz[]> {
    await this.init()
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['quizzes'], 'readonly')
      const store = transaction.objectStore('quizzes')
      const index = store.index('sessionId')
      const request = index.getAll(sessionId)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result || [])
    })
  }

  /**
   * Save a response
   */
  async saveResponse(response: StorageResponse): Promise<void> {
    await this.init()
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['responses'], 'readwrite')
      const store = transaction.objectStore('responses')
      const request = store.put(response)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  /**
   * Get all responses for a quiz
   */
  async getQuizResponses(quizId: string): Promise<StorageResponse[]> {
    await this.init()
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['responses'], 'readonly')
      const store = transaction.objectStore('responses')
      const index = store.index('quizId')
      const request = index.getAll(quizId)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result || [])
    })
  }

  /**
   * Add item to sync queue
   */
  async queueForSync(item: Omit<SyncQueueItem, 'id'>): Promise<string> {
    await this.init()
    const id = `${item.type}-${Date.now()}-${Math.random()}`
    const queueItem: SyncQueueItem = { ...item, id, retries: 0 }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['syncQueue'], 'readwrite')
      const store = transaction.objectStore('syncQueue')
      const request = store.put(queueItem)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(id)
    })
  }

  /**
   * Get all pending sync items
   */
  async getSyncQueue(): Promise<SyncQueueItem[]> {
    await this.init()
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['syncQueue'], 'readonly')
      const store = transaction.objectStore('syncQueue')
      const request = store.getAll()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result || [])
    })
  }

  /**
   * Remove item from sync queue
   */
  async removeSyncItem(id: string): Promise<void> {
    await this.init()
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['syncQueue'], 'readwrite')
      const store = transaction.objectStore('syncQueue')
      const request = store.delete(id)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  /**
   * Update retry count for sync item
   */
  async incrementSyncRetry(id: string): Promise<void> {
    await this.init()
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['syncQueue'], 'readwrite')
      const store = transaction.objectStore('syncQueue')
      const getRequest = store.get(id)

      getRequest.onsuccess = () => {
        const item = getRequest.result as SyncQueueItem
        if (item) {
          item.retries += 1
          const putRequest = store.put(item)
          putRequest.onerror = () => reject(putRequest.error)
          putRequest.onsuccess = () => resolve()
        }
      }

      getRequest.onerror = () => reject(getRequest.error)
    })
  }

  /**
   * Clear all data (for testing/reset)
   */
  async clear(): Promise<void> {
    await this.init()
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(
        ['sessions', 'quizzes', 'responses', 'syncQueue'],
        'readwrite'
      )

      const stores = ['sessions', 'quizzes', 'responses', 'syncQueue']
      let completed = 0

      stores.forEach((storeName) => {
        const store = transaction.objectStore(storeName)
        const request = store.clear()

        request.onerror = () => reject(request.error)
        request.onsuccess = () => {
          completed++
          if (completed === stores.length) resolve()
        }
      })
    })
  }

  /**
   * Get storage stats for debugging
   */
  async getStorageStats(): Promise<{
    sessionCount: number
    quizCount: number
    responseCount: number
    syncQueueCount: number
  }> {
    await this.init()

    const getCount = (storeName: string): Promise<number> => {
      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([storeName], 'readonly')
        const store = transaction.objectStore(storeName)
        const request = store.count()

        request.onerror = () => reject(request.error)
        request.onsuccess = () => resolve(request.result)
      })
    }

    const [sessionCount, quizCount, responseCount, syncQueueCount] =
      await Promise.all([
        getCount('sessions'),
        getCount('quizzes'),
        getCount('responses'),
        getCount('syncQueue'),
      ])

    return {
      sessionCount,
      quizCount,
      responseCount,
      syncQueueCount,
    }
  }
}

// Singleton instance
export const offlineStorage = new OfflineStorage()

// Export for testing
export { OfflineStorage }
