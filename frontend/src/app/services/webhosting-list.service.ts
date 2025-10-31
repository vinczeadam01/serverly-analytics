import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseAnalyticsService } from './base-analytics.service';
import { PeriodService, PeriodOption } from './period.service';
import { environment } from '../../environments/environment';

export interface WebSite {
  id: number;
  domain: string;
  status: 'active' | 'inactive' | 'degraded';
  requests24h: number;
  bandwidth24h: string; // formatted (e.g., 120 GB)
  avgResponseMs: number;
}

export interface WebhostingListData {
  sites: WebSite[];
}

@Injectable({ providedIn: 'root' })
export class WebhostingListService extends BaseAnalyticsService<WebhostingListData> {
  private _searchQuery = signal<string>('');
  private _currentPage = signal<number>(1);
  private readonly _pageSize = 10;

  readonly searchQuery = this._searchQuery.asReadonly();
  readonly currentPage = this._currentPage.asReadonly();

  constructor(http: HttpClient, periodService: PeriodService) {
    super(http, periodService);
  }

  protected getApiUrl(period: PeriodOption): string {
    return `${environment.apiUrl}/analytics/webhosting/sites?period=${period}`;
  }

  protected override loadData(period: PeriodOption, forceRefresh: boolean = false): void {
    super.loadData(period, forceRefresh);
    setTimeout(() => {
      if (this._error()) {
        this._data.set(this.generateDemoData());
        this._error.set(null);
        this._loading.set(false);
      }
    }, 800);
  }

  readonly filteredSites = computed(() => {
    const data = this._data();
    const query = this._searchQuery().toLowerCase();
    const all = data?.sites || [];
    if (!query) return all;
    return all.filter(s => s.domain.toLowerCase().includes(query) || s.status.toLowerCase().includes(query));
  });

  readonly paginatedSites = computed(() => {
    const filtered = this.filteredSites();
    const start = (this._currentPage() - 1) * this._pageSize;
    return filtered.slice(start, start + this._pageSize);
  });

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.filteredSites().length / this._pageSize)));

  setSearchQuery(query: string) {
    this._searchQuery.set(query);
    this._currentPage.set(1);
  }

  setPage(page: number) {
    const total = this.totalPages();
    if (page >= 1 && page <= total) this._currentPage.set(page);
  }

  private generateDemoData(): WebhostingListData {
    const domains = [
      'serverly.com','api.serverly.com','blog.serverly.com','shop.serverly.com','cdn.serverly.com',
      'status.serverly.com','docs.serverly.com','portal.serverly.com','admin.serverly.com','assets.serverly.com',
      'news.serverly.com','m.serverly.com','img.serverly.com','static.serverly.com','media.serverly.com',
      'download.serverly.com','support.serverly.com','careers.serverly.com','dev.serverly.com','staging.serverly.com',
    ];

    const sites: WebSite[] = domains.map((domain, idx) => {
      const requests = Math.floor(50_000 + Math.random() * 1_000_000);
      const gb = (10 + Math.random() * 500).toFixed(1);
      const statusPool: WebSite['status'][] = ['active','active','active','degraded','active','inactive'];
      return {
        id: idx + 1,
        domain,
        status: statusPool[Math.floor(Math.random() * statusPool.length)],
        requests24h: requests,
        bandwidth24h: `${gb} GB`,
        avgResponseMs: Math.floor(60 + Math.random() * 300),
      };
    });

    return { sites };
  }
}

