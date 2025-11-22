import { Observable } from 'rxjs';
import { PeriodOption } from '../../../shared/services/period.service';
import { DnsZone, QueryChartData, TopDomain, RecordTypesData, ResponseTimeChartData } from '../models/dns.models';

export interface IDnsRepository {
  getList(): Observable<DnsZone[]>;
  getById(id: string): Observable<DnsZone>;
  getQueryChart(id: string, period: PeriodOption): Observable<QueryChartData>;
  getTopDomains(id: string, period: PeriodOption): Observable<TopDomain[]>;
  getRecordTypes(id: string, period: PeriodOption): Observable<RecordTypesData>;
  getResponseTimeChart(id: string, period: PeriodOption): Observable<ResponseTimeChartData>;
}
