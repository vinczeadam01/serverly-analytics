import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IDnsRepository } from './dns.repository.interface';
import { DnsZone, QueryChartData, TopDomain, RecordTypesData, ResponseTimeChartData } from '../models/dns.models';
import { PeriodOption } from '../../../shared/services/period.service';

@Injectable({ providedIn: 'root' })
export class DnsRepository implements IDnsRepository {
  constructor(private http: HttpClient) {}

  getList(): Observable<DnsZone[]> {
    return this.http.get<DnsZone[]>(`${environment.apiUrl}/dns/list`);
  }

  getById(id: string): Observable<DnsZone> {
    return this.http.get<DnsZone>(`${environment.apiUrl}/dns/${id}`);
  }

  getQueryChart(id: string, period: PeriodOption): Observable<QueryChartData> {
    return this.http.get<QueryChartData>(`${environment.apiUrl}/dns/${id}/query-chart?period=${period}`);
  }

  getTopDomains(id: string, period: PeriodOption): Observable<TopDomain[]> {
    return this.http.get<TopDomain[]>(`${environment.apiUrl}/dns/${id}/top-domains?period=${period}`);
  }

  getRecordTypes(id: string, period: PeriodOption): Observable<RecordTypesData> {
    return this.http.get<RecordTypesData>(`${environment.apiUrl}/dns/${id}/record-types?period=${period}`);
  }

  getResponseTimeChart(id: string, period: PeriodOption): Observable<ResponseTimeChartData> {
    return this.http.get<ResponseTimeChartData>(`${environment.apiUrl}/dns/${id}/response-time-chart?period=${period}`);
  }
}
