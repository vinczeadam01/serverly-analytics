import { Observable } from 'rxjs';
import { PeriodOption } from '../../../shared/services/period.service';
import { DashboardAnalyticsData } from '../models/dashboard.models';

export interface IDashboardRepository {
  getSystemDashboard(period: PeriodOption): Observable<DashboardAnalyticsData>;
  getEmailDashboard(period: PeriodOption): Observable<DashboardAnalyticsData>;
  getVpsDashboard(period: PeriodOption): Observable<DashboardAnalyticsData>;
  getWebhostingDashboard(period: PeriodOption): Observable<DashboardAnalyticsData>;
  getDnsDashboard(period: PeriodOption): Observable<DashboardAnalyticsData>;
  getKafkaDashboard(period: PeriodOption): Observable<DashboardAnalyticsData>;
}
