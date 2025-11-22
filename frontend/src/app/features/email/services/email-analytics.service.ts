import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseAnalyticsService } from '../../../shared/services/base-analytics.service';
import { PeriodService, PeriodOption } from '../../../shared/services/period.service';
import { environment } from '../../../../environments/environment';

export interface EmailAnalyticsData {
  totalEmails: number;
  delivered: number;
  bounced: number;
  queueSize: number;
  emailFlow: {
    type: string;
    count: number;
    percentage: number;
  }[];
  topSenders: {
    email: string;
    sent: number;
  }[];
  servers: {
    server: string;
    totalProcessed: number;
    deliveryRate: number;
    queueSize: number;
    load: number;
    status: string;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class EmailAnalyticsService extends BaseAnalyticsService<EmailAnalyticsData> {
  constructor(http: HttpClient, periodService: PeriodService) {
    super(http, periodService);
  }

  protected getApiUrl(period: PeriodOption): string {
    return `${environment.apiUrl}/analytics/email?period=${period}`;
  }
}
