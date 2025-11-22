import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseAnalyticsService } from '../../../shared/services/base-analytics.service';
import { PeriodService, PeriodOption } from '../../../shared/services/period.service';
import { environment } from '../../../../environments/environment';

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
}
