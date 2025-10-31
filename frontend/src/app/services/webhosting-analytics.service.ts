import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseAnalyticsService } from './base-analytics.service';
import { PeriodService, PeriodOption } from './period.service';
import { environment } from '../../environments/environment';

export interface WebhostingAnalyticsData {
  totalRequests: number;
  avgResponseTime: number;
  errorRate: number;
  bandwidthUsage: string;
  statusCodes: {
    code: number;
    description: string;
    percentage: number;
  }[];
  topPages: {
    url: string;
    requests: number;
  }[];
  servers: {
    server: string;
    totalRequests: number;
    successRate: number;
    avgResponse: number;
    cpuLoad: number;
    status: string;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class WebhostingAnalyticsService extends BaseAnalyticsService<WebhostingAnalyticsData> {
  constructor(http: HttpClient, periodService: PeriodService) {
    super(http, periodService);
  }

  protected getApiUrl(period: PeriodOption): string {
    return `${environment.apiUrl}/analytics/webhosting?period=${period}`;
  }

  // Provide demo data if API is unavailable so dashboard charts work
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

  private generateDemoData(): WebhostingAnalyticsData {
    const topPages = [
      { url: '/index.html', requests: 456789 },
      { url: '/api/v1/users', requests: 234567 },
      { url: '/dashboard', requests: 198432 },
      { url: '/assets/styles.css', requests: 145678 },
      { url: '/api/v1/products', requests: 123456 },
    ];

    return {
      totalRequests: 2547890,
      avgResponseTime: 185,
      errorRate: 2.3,
      bandwidthUsage: '4.2 TB',
      statusCodes: [
        { code: 200, description: 'OK', percentage: 88 },
        { code: 404, description: 'Not Found', percentage: 6 },
        { code: 500, description: 'Server Error', percentage: 3 },
        { code: 301, description: 'Redirect', percentage: 3 },
      ],
      topPages,
      servers: [
        { server: 'web-01.serverly.com', totalRequests: 1234567, successRate: 98.2, avgResponse: 180, cpuLoad: 62, status: 'Online' },
        { server: 'web-02.serverly.com', totalRequests: 1113323, successRate: 97.8, avgResponse: 190, cpuLoad: 57, status: 'Online' },
      ]
    };
  }
}
