import { Observable } from 'rxjs';
import { PeriodOption } from '../../../shared/services/period.service';
import { WebhostingAccount, TrafficChartData, TopPage, StatusCodesData, BandwidthChartData } from '../models/webhosting.models';

export interface IWebhostingRepository {
  getList(): Observable<WebhostingAccount[]>;
  getById(id: string): Observable<WebhostingAccount>;
  getTrafficChart(id: string, period: PeriodOption): Observable<TrafficChartData>;
  getTopPages(id: string, period: PeriodOption): Observable<TopPage[]>;
  getStatusCodes(id: string, period: PeriodOption): Observable<StatusCodesData>;
  getBandwidthChart(id: string, period: PeriodOption): Observable<BandwidthChartData>;
}
