import { Injectable, signal, effect, Signal } from '@angular/core';
import { DashboardRepository } from '../repositories/dashboard.repository';
import { PeriodService, PeriodOption } from '../../../shared/services/period.service';
import { DashboardAnalyticsData } from '../models/dashboard.models';

export interface CachedData<T> {
  data: T;
  timestamp: number;
}


@Injectable({
  providedIn: 'root'
})
export class DashboardAnalyticsService {
  protected readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  protected cache = new Map<PeriodOption, CachedData<DashboardAnalyticsData>>();

  // Internal signals
  protected _data = signal<DashboardAnalyticsData | null>(null);
  protected _loading = signal<boolean>(false);
  protected _error = signal<string | null>(null);

  // Public readonly signals
  readonly data: Signal<DashboardAnalyticsData | null> = this._data.asReadonly();
  readonly loading: Signal<boolean> = this._loading.asReadonly();
  readonly error: Signal<string | null> = this._error.asReadonly();

  constructor(
    private dashboardRepo: DashboardRepository,
    private periodService: PeriodService
  ) {
    // Automatically react to period changes
    effect(() => {
      const period = this.periodService.selectedPeriod();
      this.loadData(period);
    });
  }

  protected loadData(period: PeriodOption, forceRefresh: boolean = false): void {
    // Check cache first
    if (!forceRefresh) {
      const cached = this.cache.get(period);
      const now = Date.now();

      if (cached && (now - cached.timestamp) < this.CACHE_DURATION) {
        this._data.set(cached.data);
        this._loading.set(false);
        this._error.set(null);
        return;
      }
    }

    // Fetch from API
    this._loading.set(true);
    this._error.set(null);

    this.dashboardRepo.getSystemDashboard(period).subscribe({
      next: (data) => {
        this.cache.set(period, { data, timestamp: Date.now() });
        this._data.set(data);
        this._loading.set(false);
        this._error.set(null);
      },
      error: (error) => {
        console.error('Failed to load dashboard data:', error);
        this._loading.set(false);
        this._error.set(error.message || 'Failed to load data');

        // Keep previous data if available
        const cached = this.cache.get(period);
        if (cached) {
          this._data.set(cached.data);
        }
      }
    });
  }

  refresh(): void {
    const currentPeriod = this.periodService.getPeriod();
    this.cache.delete(currentPeriod);
    this.loadData(currentPeriod, true);
  }

  clearCache(): void {
    this.cache.clear();
    this._data.set(null);
    this._error.set(null);
  }
}
