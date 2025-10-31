import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseAnalyticsService } from './base-analytics.service';
import { PeriodService, PeriodOption } from './period.service';
import { environment } from '../../environments/environment';

export interface VpsAnalyticsData {
  totalInstances: number;
  avgCpuUsage: number;
  avgMemoryUsage: number;
  avgDiskUsage: number;
  resourceUtilization: {
    category: string;
    count: number;
    percentage: number;
  }[];
  topVpsByUsage: {
    instance: string;
    cpu: number;
    memory: number;
  }[];
  instances: {
    instance: string;
    cpuUsage: number;
    memory: string;
    diskUsage: string;
    network: string;
    status: string;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class VpsAnalyticsService extends BaseAnalyticsService<VpsAnalyticsData> {
  constructor(http: HttpClient, periodService: PeriodService) {
    super(http, periodService);
  }

  protected getApiUrl(period: PeriodOption): string {
    return `${environment.apiUrl}/analytics/vps?period=${period}`;
  }
}
