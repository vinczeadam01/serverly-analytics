import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseAnalyticsService } from './base-analytics.service';
import { PeriodService, PeriodOption } from './period.service';
import { environment } from '../../environments/environment';

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

  protected override loadData(period: PeriodOption, forceRefresh: boolean = false): void {
    super.loadData(period, forceRefresh);
    setTimeout(() => {
      if (this._error()) {
        this._data.set(this.demo());
        this._error.set(null);
        this._loading.set(false);
      }
    }, 600);
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

  private demo(): VpsListData {
    const names = [
      'vps-prod-db-01','vps-web-app-03','vps-api-02','vps-cache-redis-01','vps-worker-05',
      'vps-mq-01','vps-logging-02','vps-monitor-01','vps-gateway-01','vps-cdn-01',
      'vps-batch-01','vps-ml-01'
    ];
    const hosts: VpsHostRow[] = names.map((hostname, i) => {
      const cpu = Math.floor(20 + Math.random()*80);
      const memory = Math.floor(20 + Math.random()*80);
      const disk = Math.floor(20 + Math.random()*80);
      const netInMbps = Math.floor(10 + Math.random()*300);
      const netOutMbps = Math.floor(10 + Math.random()*300);
      const statuses: VpsHostRow['status'][] = ['online','online','online','degraded','online','offline'];
      return { id: i+1, hostname, cpu, memory, disk, netInMbps, netOutMbps, status: statuses[Math.floor(Math.random()*statuses.length)] };
    });
    return { hosts };
  }
}

