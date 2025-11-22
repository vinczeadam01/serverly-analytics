import { Injectable, signal, effect } from '@angular/core';

export type PeriodOption = '15m' | '1h' | '24h' | '7d' | '30d';

@Injectable({
  providedIn: 'root'
})
export class PeriodService {
  private readonly STORAGE_KEY = 'serverly-analytics-period';
  private readonly DEFAULT_PERIOD: PeriodOption = '24h';

  // Signal for reactive period state
  private _selectedPeriod = signal<PeriodOption>(this.loadFromStorage());

  // Public readonly signal
  readonly selectedPeriod = this._selectedPeriod.asReadonly();

  constructor() {
    // Effect to persist changes to localStorage
    effect(() => {
      const period = this._selectedPeriod();
      this.saveToStorage(period);
    });
  }

  /**
   * Set the selected period
   */
  setPeriod(period: PeriodOption): void {
    this._selectedPeriod.set(period);
  }

  /**
   * Get the current period value
   */
  getPeriod(): PeriodOption {
    return this._selectedPeriod();
  }

  /**
   * Load period from localStorage
   */
  private loadFromStorage(): PeriodOption {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored && this.isValidPeriod(stored)) {
        return stored as PeriodOption;
      }
    } catch (error) {
      console.error('Failed to load period from localStorage:', error);
    }
    return this.DEFAULT_PERIOD;
  }

  /**
   * Save period to localStorage
   */
  private saveToStorage(period: PeriodOption): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, period);
    } catch (error) {
      console.error('Failed to save period to localStorage:', error);
    }
  }

  /**
   * Validate period option
   */
  private isValidPeriod(value: string): boolean {
    return ['15m', '1h', '24h', '7d', '30d'].includes(value);
  }
}
