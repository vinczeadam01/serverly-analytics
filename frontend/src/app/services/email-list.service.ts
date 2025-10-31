import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseAnalyticsService } from './base-analytics.service';
import { PeriodService, PeriodOption } from './period.service';
import { environment } from '../../environments/environment';

export interface EmailDomainRow {
  id: number;
  domain: string;
  inbound24h: number;
  outbound24h: number;
  bounced24h: number;
  spam24h: number;
  total24h: number;
}

export interface EmailListData {
  domains: EmailDomainRow[];
}

@Injectable({ providedIn: 'root' })
export class EmailListService extends BaseAnalyticsService<EmailListData> {
  private _searchQuery = signal<string>('');
  private _currentPage = signal<number>(1);
  private readonly _pageSize = 10;

  readonly searchQuery = this._searchQuery.asReadonly();
  readonly currentPage = this._currentPage.asReadonly();

  constructor(http: HttpClient, periodService: PeriodService) {
    super(http, periodService);
  }

  protected getApiUrl(period: PeriodOption): string {
    return `${environment.apiUrl}/analytics/email/domains?period=${period}`;
  }

  protected override loadData(period: PeriodOption, forceRefresh: boolean = false): void {
    super.loadData(period, forceRefresh);
    setTimeout(() => {
      if (this._error()) {
        this._data.set(this.generateDemoData());
        this._error.set(null);
        this._loading.set(false);
      }
    }, 600);
  }

  readonly filteredDomains = computed(() => {
    const query = this._searchQuery().toLowerCase();
    const all = this._data()?.domains || [];
    if (!query) return all;
    return all.filter(d => d.domain.toLowerCase().includes(query));
  });

  readonly paginatedDomains = computed(() => {
    const start = (this._currentPage() - 1) * this._pageSize;
    return this.filteredDomains().slice(start, start + this._pageSize);
  });

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.filteredDomains().length / this._pageSize)));

  setSearchQuery(query: string) { this._searchQuery.set(query); this._currentPage.set(1); }
  setPage(page: number) { const t = this.totalPages(); if (page>=1 && page<=t) this._currentPage.set(page); }

  private generateDemoData(): EmailListData {
    const domains = [
      'serverly.com','marketing.serverly.com','support.serverly.com','billing.serverly.com','alerts.serverly.com',
      'news.serverly.com','shop.serverly.com','blog.serverly.com','careers.serverly.com','portal.serverly.com',
      'dev.serverly.com','staging.serverly.com'
    ];
    const rows: EmailDomainRow[] = domains.map((domain, i) => {
      const inbound = Math.floor(5_000 + Math.random()*50_000);
      const outbound = Math.floor(4_000 + Math.random()*40_000);
      const bounced = Math.floor(outbound * (0.01 + Math.random()*0.04));
      const spam = Math.floor(inbound * (0.02 + Math.random()*0.05));
      const total = inbound + outbound;
      return { id: i+1, domain, inbound24h: inbound, outbound24h: outbound, bounced24h: bounced, spam24h: spam, total24h: total };
    });
    return { domains: rows };
  }
}

