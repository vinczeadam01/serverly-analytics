import { Observable } from 'rxjs';
import { PeriodOption } from '../../../shared/services/period.service';
import { EmailAccount, FlowChartData, TopRecipient, TopSender, ServerMetrics } from '../models/email.models';

export interface IEmailRepository {
  getList(): Observable<EmailAccount[]>;
  getById(id: string): Observable<EmailAccount>;
  getFlowChart(id: string, period: PeriodOption): Observable<FlowChartData>;
  getTopRecipients(id: string, period: PeriodOption): Observable<TopRecipient[]>;
  getTopSenders(id: string, period: PeriodOption): Observable<TopSender[]>;
  getServers(id: string, period: PeriodOption): Observable<ServerMetrics[]>;
}
