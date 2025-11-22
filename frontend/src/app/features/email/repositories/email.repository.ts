import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IEmailRepository } from './email.repository.interface';
import { EmailAccount, FlowChartData, TopRecipient, TopSender, ServerMetrics } from '../models/email.models';
import { PeriodOption } from '../../../shared/services/period.service';

@Injectable({ providedIn: 'root' })
export class EmailRepository implements IEmailRepository {
  constructor(private http: HttpClient) {}

  getList(): Observable<EmailAccount[]> {
    return this.http.get<EmailAccount[]>(`${environment.apiUrl}/email/list`);
  }

  getById(id: string): Observable<EmailAccount> {
    return this.http.get<EmailAccount>(`${environment.apiUrl}/email/${id}`);
  }

  getFlowChart(id: string, period: PeriodOption): Observable<FlowChartData> {
    return this.http.get<FlowChartData>(`${environment.apiUrl}/email/${id}/flow-chart?period=${period}`);
  }

  getTopRecipients(id: string, period: PeriodOption): Observable<TopRecipient[]> {
    return this.http.get<TopRecipient[]>(`${environment.apiUrl}/email/${id}/top-recipients?period=${period}`);
  }

  getTopSenders(id: string, period: PeriodOption): Observable<TopSender[]> {
    return this.http.get<TopSender[]>(`${environment.apiUrl}/email/${id}/top-senders?period=${period}`);
  }

  getServers(id: string, period: PeriodOption): Observable<ServerMetrics[]> {
    return this.http.get<ServerMetrics[]>(`${environment.apiUrl}/email/${id}/servers?period=${period}`);
  }
}
