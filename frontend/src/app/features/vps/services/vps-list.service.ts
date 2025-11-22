import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseAnalyticsService } from '../../../shared/services/base-analytics.service';
import { PeriodService, PeriodOption } from '../../../shared/services/period.service';
import { environment } from '../../../../environments/environment';

export interface VpsHostRow {
  id: number;
  hostname: string;
  cpu: number; // %
  memory: number; // %
  disk: number; // %
  netInMbps: number;
  netOutMbps: number;
  status: 'online' | 'offline' | 'degraded';
}

export interface VpsListData { hosts: VpsHostRow[] }

@Injectable({ providedIn: 'root' })
export class VpsListService extends BaseAnalyticsService<VpsListData> {
  private _search = signal<string>('');
  private _page = signal<number>(1);
  private readonly _pageSize = 10;

  readonly search = this._search.asReadonly();
  readonly page = this._page.asReadonly();

  constructor(http: HttpClient, periodService: PeriodService) { super(http, periodService); }

  protected getApiUrl(period: PeriodOption): string {
    return `${environment.apiUrl}/analytics/vps/hosts?period=${period}`;
  }


  readonly filtered = computed(() => {
    const q = this._search().toLowerCase();
    const all = this._data()?.hosts || [];
    if (!q) return all;
    return all.filter(h => h.hostname.toLowerCase().includes(q) || h.status.toLowerCase().includes(q));
  });

  readonly paginated = computed(() => {
    const start = (this._page() - 1) * this._pageSize;
    return this.filtered().slice(start, start + this._pageSize);
  });

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.filtered().length / this._pageSize)));

  setSearch(q: string) { this._search.set(q); this._page.set(1); }
  setPage(p: number) { const t = this.totalPages(); if (p>=1 && p<=t) this._page.set(p); }

}

