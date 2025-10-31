import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseAnalyticsService } from './base-analytics.service';
import { PeriodService, PeriodOption } from './period.service';
import { environment } from '../../environments/environment';

export interface DnsZone {
  id: number;
  zone: string;
  type: string;
  records: number;
  lastUpdate: string;
  status: 'active' | 'inactive' | 'pending';
  queries24h: number;
}

export interface DnsAnalyticsData {
  totalQueries: number;
  successRate: number;
  avgQueryTime: number;
  failedQueries: number;
  queryTypes: {
    type: string;
    count: number;
    percentage: number;
  }[];
  topDomains: {
    domain: string;
    queries: number;
  }[];
  servers: {
    server: string;
    totalQueries: number;
    successRate: number;
    avgResponse: number;
    load: number;
    status: string;
  }[];
  zones: DnsZone[];
}

@Injectable({
  providedIn: 'root'
})
export class DnsListService extends BaseAnalyticsService<DnsAnalyticsData> {
  // Search and pagination state
  private _searchQuery = signal<string>('');
  private _currentPage = signal<number>(1);
  private readonly _pageSize = 10;

  readonly searchQuery = this._searchQuery.asReadonly();
  readonly currentPage = this._currentPage.asReadonly();

  constructor(http: HttpClient, periodService: PeriodService) {
    super(http, periodService);
  }

  protected getApiUrl(period: PeriodOption): string {
    return `${environment.apiUrl}/analytics/dns?period=${period}`;
  }

  /**
   * Override loadData to include demo data when API is not available
   */
  protected override loadData(period: PeriodOption, forceRefresh: boolean = false): void {
    // Try to load from API first
    super.loadData(period, forceRefresh);

    // For demo purposes, if API fails, use demo data
    // In production, remove this and handle errors properly
    setTimeout(() => {
      if (this._error()) {
        this._data.set(this.generateDemoData());
        this._error.set(null);
        this._loading.set(false);
      }
    }, 1000);
  }

  /**
   * Filtered and paginated zones based on search query
   */
  readonly filteredZones = computed(() => {
    const data = this._data();
    if (!data?.zones) return [];

    const query = this._searchQuery().toLowerCase();
    let filtered = data.zones;

    if (query) {
      filtered = filtered.filter(zone =>
        zone.zone.toLowerCase().includes(query) ||
        zone.type.toLowerCase().includes(query)
      );
    }

    return filtered;
  });

  /**
   * Paginated zones for current page
   */
  readonly paginatedZones = computed(() => {
    const filtered = this.filteredZones();
    const page = this._currentPage();
    const start = (page - 1) * this._pageSize;
    const end = start + this._pageSize;
    return filtered.slice(start, end);
  });

  /**
   * Total pages based on filtered results
   */
  readonly totalPages = computed(() => {
    const filtered = this.filteredZones();
    return Math.ceil(filtered.length / this._pageSize);
  });

  /**
   * Total filtered zones count
   */
  readonly totalZones = computed(() => {
    return this.filteredZones().length;
  });

  /**
   * Set search query and reset to first page
   */
  setSearchQuery(query: string): void {
    this._searchQuery.set(query);
    this._currentPage.set(1);
  }

  /**
   * Set current page
   */
  setPage(page: number): void {
    const total = this.totalPages();
    if (page >= 1 && page <= total) {
      this._currentPage.set(page);
    }
  }

  /**
   * Navigate to next page
   */
  nextPage(): void {
    this.setPage(this._currentPage() + 1);
  }

  /**
   * Navigate to previous page
   */
  previousPage(): void {
    this.setPage(this._currentPage() - 1);
  }

  /**
   * Generate demo DNS zones data
   */
  private generateDemoData(): DnsAnalyticsData {
    const zones: DnsZone[] = [
      { id: 1, zone: 'serverly.com', type: 'Master', records: 45, lastUpdate: '2025-10-27 10:30', status: 'active', queries24h: 125430 },
      { id: 2, zone: 'api.serverly.com', type: 'Master', records: 12, lastUpdate: '2025-10-27 09:15', status: 'active', queries24h: 89234 },
      { id: 3, zone: 'cdn.serverly.com', type: 'Master', records: 8, lastUpdate: '2025-10-27 11:20', status: 'active', queries24h: 234567 },
      { id: 4, zone: 'mail.serverly.com', type: 'Master', records: 23, lastUpdate: '2025-10-27 08:45', status: 'active', queries24h: 45678 },
      { id: 5, zone: 'staging.serverly.com', type: 'Master', records: 34, lastUpdate: '2025-10-26 14:30', status: 'active', queries24h: 12345 },
      { id: 6, zone: 'dev.serverly.com', type: 'Master', records: 18, lastUpdate: '2025-10-27 07:00', status: 'inactive', queries24h: 5678 },
      { id: 7, zone: 'test.serverly.com', type: 'Slave', records: 15, lastUpdate: '2025-10-27 10:00', status: 'active', queries24h: 8901 },
      { id: 8, zone: 'blog.serverly.com', type: 'Master', records: 9, lastUpdate: '2025-10-27 06:30', status: 'active', queries24h: 34567 },
      { id: 9, zone: 'shop.serverly.com', type: 'Master', records: 67, lastUpdate: '2025-10-27 11:45', status: 'active', queries24h: 98765 },
      { id: 10, zone: 'admin.serverly.com', type: 'Master', records: 11, lastUpdate: '2025-10-27 09:00', status: 'active', queries24h: 23456 },
      { id: 11, zone: 'portal.serverly.com', type: 'Master', records: 28, lastUpdate: '2025-10-26 18:20', status: 'pending', queries24h: 12987 },
      { id: 12, zone: 'docs.serverly.com', type: 'Master', records: 5, lastUpdate: '2025-10-27 10:15', status: 'active', queries24h: 45123 },
      { id: 13, zone: 'support.serverly.com', type: 'Master', records: 14, lastUpdate: '2025-10-27 08:00', status: 'active', queries24h: 67890 },
      { id: 14, zone: 'status.serverly.com', type: 'Master', records: 6, lastUpdate: '2025-10-27 11:00', status: 'active', queries24h: 34512 },
      { id: 15, zone: 'analytics.serverly.com', type: 'Master', records: 19, lastUpdate: '2025-10-27 09:30', status: 'active', queries24h: 56789 },
      { id: 16, zone: 'demo.serverly.com', type: 'Slave', records: 21, lastUpdate: '2025-10-26 16:45', status: 'inactive', queries24h: 3456 },
      { id: 17, zone: 'backup.serverly.com', type: 'Master', records: 7, lastUpdate: '2025-10-27 07:30', status: 'active', queries24h: 12345 },
      { id: 18, zone: 'vpn.serverly.com', type: 'Master', records: 4, lastUpdate: '2025-10-27 10:45', status: 'active', queries24h: 78901 },
      { id: 19, zone: 'git.serverly.com', type: 'Master', records: 13, lastUpdate: '2025-10-27 08:30', status: 'active', queries24h: 23789 },
      { id: 20, zone: 'ci.serverly.com', type: 'Master', records: 10, lastUpdate: '2025-10-27 09:45', status: 'active', queries24h: 45612 },
      { id: 21, zone: 'monitoring.serverly.com', type: 'Master', records: 16, lastUpdate: '2025-10-27 11:15', status: 'active', queries24h: 89012 },
      { id: 22, zone: 'logs.serverly.com', type: 'Master', records: 8, lastUpdate: '2025-10-27 06:00', status: 'active', queries24h: 34567 },
      { id: 23, zone: 'metrics.serverly.com', type: 'Slave', records: 12, lastUpdate: '2025-10-26 20:30', status: 'pending', queries24h: 9876 },
      { id: 24, zone: 'wiki.serverly.com', type: 'Master', records: 22, lastUpdate: '2025-10-27 10:00', status: 'active', queries24h: 56234 },
      { id: 25, zone: 'files.serverly.com', type: 'Master', records: 31, lastUpdate: '2025-10-27 09:15', status: 'active', queries24h: 78345 }
    ];

    return {
      totalQueries: 1234567,
      successRate: 98.7,
      avgQueryTime: 12,
      failedQueries: 16089,
      queryTypes: [
        { type: 'A', count: 802455, percentage: 65 },
        { type: 'AAAA', count: 222222, percentage: 18 },
        { type: 'MX', count: 98765, percentage: 8 },
        { type: 'TXT', count: 111125, percentage: 9 }
      ],
      topDomains: [
        { domain: 'google.com', queries: 45678 },
        { domain: 'cloudflare.com', queries: 38234 },
        { domain: 'github.com', queries: 29567 },
        { domain: 'amazon.com', queries: 24890 },
        { domain: 'microsoft.com', queries: 21345 }
      ],
      servers: [
        { server: 'dns-01.serverly.com', totalQueries: 654321, successRate: 99.2, avgResponse: 11, load: 45, status: 'Online' },
        { server: 'dns-02.serverly.com', totalQueries: 580246, successRate: 98.8, avgResponse: 13, load: 75, status: 'Online' }
      ],
      zones
    };
  }
}
