/**
 * Performance monitoring utilities
 */

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initializeObservers();
  }

  private initializeObservers() {
    // Observe Web Vitals metrics
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      try {
        // Largest Contentful Paint (LCP)
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          this.recordMetric('LCP', lastEntry.renderTime || lastEntry.loadTime);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);

        // First Input Delay (FID)
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            this.recordMetric('FID', entry.processingStart - entry.startTime);
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);

        // Cumulative Layout Shift (CLS)
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
              this.recordMetric('CLS', clsValue);
            }
          });
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(clsObserver);
      } catch (error) {
        console.warn('Performance monitoring not fully supported:', error);
      }
    }
  }

  recordMetric(name: string, value: number) {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
    };
    this.metrics.push(metric);

    // Log to console in development
    if (import.meta.env.DEV) {
      console.log(`[Performance] ${name}:`, value.toFixed(2));
    }

    // Send to analytics in production (placeholder)
    if (import.meta.env.PROD) {
      this.sendToAnalytics(metric);
    }
  }

  private sendToAnalytics(_metric: PerformanceMetric) {
    // Placeholder for analytics integration
    // In production, this would send to your analytics service
    // e.g., Google Analytics, Mixpanel, etc.
  }

  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  clearMetrics() {
    this.metrics = [];
  }

  disconnect() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Measure component render time
 */
export function measureRender(componentName: string) {
  const startTime = performance.now();
  
  return () => {
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    performanceMonitor.recordMetric(`Render:${componentName}`, renderTime);
  };
}

/**
 * Measure API call duration
 */
export function measureApiCall(endpoint: string) {
  const startTime = performance.now();
  
  return () => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    performanceMonitor.recordMetric(`API:${endpoint}`, duration);
  };
}

/**
 * Report Web Vitals to console
 */
export function reportWebVitals() {
  if (typeof window !== 'undefined' && 'performance' in window) {
    // Navigation timing
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      performanceMonitor.recordMetric('TTFB', navigation.responseStart - navigation.requestStart);
      performanceMonitor.recordMetric('DOMContentLoaded', navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart);
      performanceMonitor.recordMetric('LoadComplete', navigation.loadEventEnd - navigation.loadEventStart);
    }

    // Paint timing
    const paintEntries = performance.getEntriesByType('paint');
    paintEntries.forEach((entry) => {
      performanceMonitor.recordMetric(entry.name, entry.startTime);
    });
  }
}
