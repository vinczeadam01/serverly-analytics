import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IDashboardRepository } from './dashboard.repository.interface';
import { DashboardAnalyticsData } from '../models/dashboard.models';
import { PeriodOption } from '../../../shared/services/period.service';

@Injectable({ providedIn: 'root' })
export class DashboardRepository implements IDashboardRepository {
  constructor(private http: HttpClient) {}

  getSystemDashboard(period: PeriodOption): Observable<DashboardAnalyticsData> {
    return this.http.get<DashboardAnalyticsData>(`${environment.apiUrl}/dashboard?period=${period}`);
  }

  getEmailDashboard(period: PeriodOption): Observable<DashboardAnalyticsData> {
    return this.http.get<DashboardAnalyticsData>(`${environment.apiUrl}/dashboard/email?period=${period}`);
  }

  getVpsDashboard(period: PeriodOption): Observable<DashboardAnalyticsData> {
    return this.http.get<DashboardAnalyticsData>(`${environment.apiUrl}/dashboard/vps?period=${period}`);
  }

  getWebhostingDashboard(period: PeriodOption): Observable<DashboardAnalyticsData> {
    return this.http.get<DashboardAnalyticsData>(`${environment.apiUrl}/dashboard/webhosting?period=${period}`);
  }

  getDnsDashboard(period: PeriodOption): Observable<DashboardAnalyticsData> {
    return this.http.get<DashboardAnalyticsData>(`${environment.apiUrl}/dashboard/dns?period=${period}`);
  }

  getKafkaDashboard(period: PeriodOption): Observable<DashboardAnalyticsData> {
    return this.http.get<DashboardAnalyticsData>(`${environment.apiUrl}/dashboard/kafka?period=${period}`);
  }
}
