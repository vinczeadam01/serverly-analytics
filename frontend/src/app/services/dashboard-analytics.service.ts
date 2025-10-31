import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseAnalyticsService } from './base-analytics.service';
import { PeriodService, PeriodOption } from './period.service';
import { environment } from '../../environments/environment';

export interface DashboardAnalyticsData {
  totalRequests: number;
  errorRate: number;
  avgResponseTime: number;
  activeHosts: number;
  serviceBreakdown: {
    service: string;
    requests: number;
    percentage: number;
  }[];
  recentAlerts: {
    type: string;
    message: string;
    timestamp: string;
  }[];
  topHosts: {
    host: string;
    service: string;
    totalRequests: number;
    errorRate: number;
    avgLatency: number;
    status: string;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardAnalyticsService extends BaseAnalyticsService<DashboardAnalyticsData> {
  constructor(http: HttpClient, periodService: PeriodService) {
    super(http, periodService);
  }

  protected getApiUrl(period: PeriodOption): string {
    return `${environment.apiUrl}/analytics/dashboard?period=${period}`;
  }
}
