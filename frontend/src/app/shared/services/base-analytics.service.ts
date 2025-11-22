import { signal, effect, Signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { PeriodService, PeriodOption } from './period.service';

export interface CachedData<T> {
  data: T;
  timestamp: number;
}

export interface AnalyticsState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Base analytics service with caching and reactive period handling
 * All analytics services should extend this class
 */
export abstract class BaseAnalyticsService<T> {
  protected readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  protected cache = new Map<PeriodOption, CachedData<T>>();

  // Internal signals
  protected _data = signal<T | null>(null);
  protected _loading = signal<boolean>(false);
  protected _error = signal<string | null>(null);

  // Public readonly signals
  readonly data: Signal<T | null> = this._data.asReadonly();
  readonly loading: Signal<boolean> = this._loading.asReadonly();
  readonly error: Signal<string | null> = this._error.asReadonly();

  constructor(
    protected http: HttpClient,
    protected periodService: PeriodService
  ) {
    // Automatically react to period changes
    effect(() => {
      const period = this.periodService.selectedPeriod();
      this.loadData(period);
    });
  }

  /**
   * Abstract method to build the API endpoint URL
   * Must be implemented by child services
   */
  protected abstract getApiUrl(period: PeriodOption): string;

  /**
   * Load data for a specific period with caching
   */
  protected loadData(period: PeriodOption, forceRefresh: boolean = false): void {
    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cached = this.cache.get(period);
      const now = Date.now();

      if (cached && (now - cached.timestamp) < this.CACHE_DURATION) {
        // Cache is still fresh, use it
        this._data.set(cached.data);
        this._loading.set(false);
        this._error.set(null);
        return;
      }
    }

    // Fetch from API
    this._loading.set(true);
    this._error.set(null);

    const url = this.getApiUrl(period);

    this.http.get<T>(url).subscribe({
      next: (data) => {
        // Update cache
        this.cache.set(period, {
          data,
          timestamp: Date.now()
        });

        // Update signals
        this._data.set(data);
        this._loading.set(false);
        this._error.set(null);
      },
      error: (error: HttpErrorResponse) => {
        console.error(`Failed to load analytics data from ${url}:`, error);

        const errorMessage = error.error?.message || error.message || 'Failed to load data';

        this._loading.set(false);
        this._error.set(errorMessage);

        // Keep previous data if available
        const cached = this.cache.get(period);
        if (cached) {
          this._data.set(cached.data);
        }
      }
    });
  }

  /**
   * Force refresh data for current period (invalidates cache)
   */
  refresh(): void {
    const currentPeriod = this.periodService.getPeriod();
    this.cache.delete(currentPeriod);
    this.loadData(currentPeriod, true);
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.cache.clear();
    this._data.set(null);
    this._error.set(null);
  }
}
