// Debug utility để monitor API calls

interface ApiCallLog {
  timestamp: string;
  type: string;
  url: string;
}

interface ApiCallSummary {
  total: number;
  refreshTokenCalls: number;
  recentCalls: ApiCallLog[];
}

declare global {
  interface Window {
    debugUtils?: DebugUtils;
  }
}

class DebugUtils {
  private apiCallCount: number = 0;
  private apiCallLog: ApiCallLog[] = [];
  private isMonitoring: boolean = false;
  private monitorInterval: ReturnType<typeof setInterval> | null = null;

  startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.apiCallCount = 0;
    this.apiCallLog = [];
    
    console.log('🔍 API Monitoring started');
    
    // Monitor fetch calls
    const originalFetch = window.fetch;
    window.fetch = (...args: Parameters<typeof fetch>) => {
      this.logApiCall('fetch', args[0] as string);
      return originalFetch.apply(this, args);
    };
    
    // Monitor XMLHttpRequest
    const originalXHROpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method: string, url: string, async?: boolean, username?: string | null, password?: string | null) {
      this.addEventListener('load', () => {
        debugUtils.logApiCall('xhr', url);
      });
      return originalXHROpen.call(this, method, url, async ?? true, username, password);
    };
    
    // Log every 5 seconds
    this.monitorInterval = setInterval(() => {
      if (this.apiCallCount > 0) {
        console.log(`📊 API Calls in last 5s: ${this.apiCallCount}`);
        this.apiCallCount = 0;
      }
    }, 5000);
  }

  stopMonitoring(): void {
    if (!this.isMonitoring) return;
    
    this.isMonitoring = false;
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
    }
    console.log('🔍 API Monitoring stopped');
    console.log('📋 Total API calls logged:', this.apiCallLog.length);
  }

  logApiCall(type: string, url: string | Request | URL): void {
    this.apiCallCount++;
    const urlString = typeof url === 'string' ? url : (url as Request)?.url || 'unknown';
    
    this.apiCallLog.push({
      timestamp: new Date().toISOString(),
      type,
      url: urlString
    });
    
    // Log if it's a refresh token call
    if (urlString && urlString.includes('/auth/refresh')) {
      console.warn('🔄 Refresh token called:', urlString);
    }
  }

  getApiCallSummary(): ApiCallSummary {
    const summary: ApiCallSummary = {
      total: this.apiCallLog.length,
      refreshTokenCalls: this.apiCallLog.filter(call => 
        call.url && call.url.includes('/auth/refresh')
      ).length,
      recentCalls: this.apiCallLog.slice(-10)
    };
    
    console.table(summary);
    return summary;
  }

  clearLog(): void {
    this.apiCallLog = [];
    this.apiCallCount = 0;
  }
}

// Create singleton instance
const debugUtils = new DebugUtils();

// Auto-start monitoring in development
if (import.meta.env.DEV) {
  debugUtils.startMonitoring();
  
  // Expose to window for debugging
  window.debugUtils = debugUtils;
}

export default debugUtils; 