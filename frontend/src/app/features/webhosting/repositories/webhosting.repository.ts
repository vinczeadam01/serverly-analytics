import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IWebhostingRepository } from './webhosting.repository.interface';
import { WebhostingAccount, TrafficChartData, TopPage, StatusCodesData, BandwidthChartData } from '../models/webhosting.models';
import { PeriodOption } from '../../../shared/services/period.service';

@Injectable({ providedIn: 'root' })
export class WebhostingRepository implements IWebhostingRepository {
  constructor(private http: HttpClient) {}

  getList(): Observable<WebhostingAccount[]> {
    return this.http.get<WebhostingAccount[]>(`${environment.apiUrl}/webhosting/list`);
  }

  getById(id: string): Observable<WebhostingAccount> {
    return this.http.get<WebhostingAccount>(`${environment.apiUrl}/webhosting/${id}`);
  }

  getTrafficChart(id: string, period: PeriodOption): Observable<TrafficChartData> {
    return this.http.get<TrafficChartData>(`${environment.apiUrl}/webhosting/${id}/traffic-chart?period=${period}`);
  }

  getTopPages(id: string, period: PeriodOption): Observable<TopPage[]> {
    return this.http.get<TopPage[]>(`${environment.apiUrl}/webhosting/${id}/top-pages?period=${period}`);
  }

  getStatusCodes(id: string, period: PeriodOption): Observable<StatusCodesData> {
    return this.http.get<StatusCodesData>(`${environment.apiUrl}/webhosting/${id}/status-codes?period=${period}`);
  }

  getBandwidthChart(id: string, period: PeriodOption): Observable<BandwidthChartData> {
    return this.http.get<BandwidthChartData>(`${environment.apiUrl}/webhosting/${id}/bandwidth-chart?period=${period}`);
  }
}
