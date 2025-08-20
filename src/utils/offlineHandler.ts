import { AuthError, ErrorCode } from '../types/error';

interface OfflineOperation {
  id: string;
  type: string;
  data: any;
  timestamp: number;
  retryCount: number;
}

class OfflineHandler {
  private static instance: OfflineHandler;
  private pendingOperations: OfflineOperation[] = [];
  private readonly STORAGE_KEY = 'gms_offline_operations';
  private readonly MAX_RETRY_COUNT = 3;

  private constructor() {
    this.loadPendingOperations();
    this.setupOnlineListener();
  }

  static getInstance(): OfflineHandler {
    if (!OfflineHandler.instance) {
      OfflineHandler.instance = new OfflineHandler();
    }
    return OfflineHandler.instance;
  }

  /**
   * Check if the error indicates backend unavailability
   */
  isBackendUnavailable(error: any): boolean {
    if (!error) return false;
    
    // Check for network errors
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
      return true;
    }
    
    // Check for CORS errors (indicates server not responding)
    if (error.message && error.message.includes('CORS')) {
      return true;
    }
    
    // Check for parsed error codes
    if (error.code === ErrorCode.NETWORK_ERROR || error.code === ErrorCode.SERVICE_UNAVAILABLE) {
      return true;
    }
    
    return false;
  }

  /**
   * Queue operation for retry when backend becomes available
   */
  queueOperation(type: string, data: any): string {
    const operation: OfflineOperation = {
      id: this.generateId(),
      type,
      data,
      timestamp: Date.now(),
      retryCount: 0
    };

    this.pendingOperations.push(operation);
    this.savePendingOperations();
    
    console.log(`📥 Queued offline operation: ${type}`, operation);
    return operation.id;
  }

  /**
   * Get pending operations count
   */
  getPendingOperationsCount(): number {
    return this.pendingOperations.length;
  }

  /**
   * Get pending operations by type
   */
  getPendingOperations(type?: string): OfflineOperation[] {
    if (type) {
      return this.pendingOperations.filter(op => op.type === type);
    }
    return [...this.pendingOperations];
  }

  /**
   * Remove operation from queue
   */
  removeOperation(id: string): void {
    this.pendingOperations = this.pendingOperations.filter(op => op.id !== id);
    this.savePendingOperations();
  }

  /**
   * Clear all pending operations
   */
  clearPendingOperations(): void {
    this.pendingOperations = [];
    this.savePendingOperations();
  }

  /**
   * Process pending operations when backend becomes available
   */
  async processPendingOperations(): Promise<void> {
    if (this.pendingOperations.length === 0) return;

    console.log(`🔄 Processing ${this.pendingOperations.length} pending operations...`);
    
    const operations = [...this.pendingOperations];
    
    for (const operation of operations) {
      try {
        await this.retryOperation(operation);
        this.removeOperation(operation.id);
        console.log(`✅ Successfully processed operation: ${operation.type}`);
      } catch (error) {
        operation.retryCount++;
        
        if (operation.retryCount >= this.MAX_RETRY_COUNT) {
          console.error(`❌ Max retries exceeded for operation: ${operation.type}`, error);
          this.removeOperation(operation.id);
        } else {
          console.warn(`⚠️ Retry ${operation.retryCount}/${this.MAX_RETRY_COUNT} failed for operation: ${operation.type}`, error);
        }
      }
    }
    
    this.savePendingOperations();
  }

  /**
   * Get user-friendly message for offline mode
   */
  getOfflineMessage(operationType: string): string {
    const messages: { [key: string]: string } = {
      login: 'Your login attempt has been saved and will be processed when connection is restored.',
      application_submit: 'Your application has been saved locally and will be submitted when connection is restored.',
      document_upload: 'Your document has been saved locally and will be uploaded when connection is restored.',
      review_submit: 'Your review has been saved locally and will be submitted when connection is restored.',
      default: 'This action has been saved locally and will be processed when connection is restored.'
    };
    
    return messages[operationType] || messages.default;
  }

  /**
   * Check if operation can be performed offline
   */
  canPerformOffline(operationType: string): boolean {
    const offlineCapableOperations = [
      'application_draft_save',
      'document_cache',
      'form_validation',
      'local_search'
    ];
    
    return offlineCapableOperations.includes(operationType);
  }

  private async retryOperation(operation: OfflineOperation): Promise<void> {
    // This would integrate with your actual service methods
    // For now, we'll just simulate the retry logic
    
    switch (operation.type) {
      case 'login':
        // Retry login operation
        throw new Error('Login retry not implemented yet');
      
      case 'application_submit':
        // Retry application submission
        throw new Error('Application submission retry not implemented yet');
      
      case 'document_upload':
        // Retry document upload
        throw new Error('Document upload retry not implemented yet');
      
      default:
        throw new Error(`Unknown operation type: ${operation.type}`);
    }
  }

  private setupOnlineListener(): void {
    window.addEventListener('online', () => {
      console.log('🌐 Connection restored, processing pending operations...');
      this.processPendingOperations();
    });
    
    window.addEventListener('offline', () => {
      console.log('📴 Connection lost, entering offline mode...');
    });
  }

  private loadPendingOperations(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.pendingOperations = JSON.parse(stored);
        console.log(`📂 Loaded ${this.pendingOperations.length} pending operations from storage`);
      }
    } catch (error) {
      console.error('Failed to load pending operations:', error);
      this.pendingOperations = [];
    }
  }

  private savePendingOperations(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.pendingOperations));
    } catch (error) {
      console.error('Failed to save pending operations:', error);
    }
  }

  private generateId(): string {
    return `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const offlineHandler = OfflineHandler.getInstance();
export default offlineHandler;
