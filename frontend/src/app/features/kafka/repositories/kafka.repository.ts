import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IKafkaRepository } from './kafka.repository.interface';
import { MessagesChartData, TopTopic, ConsumerLagData, ThroughputChartData } from '../models/kafka.models';
import { PeriodOption } from '../../../shared/services/period.service';

@Injectable({ providedIn: 'root' })
export class KafkaRepository implements IKafkaRepository {
  constructor(private http: HttpClient) {}

  getMessagesChart(period: PeriodOption): Observable<MessagesChartData> {
    return this.http.get<MessagesChartData>(`${environment.apiUrl}/kafka/messages-chart?period=${period}`);
  }

  getTopTopics(period: PeriodOption): Observable<TopTopic[]> {
    return this.http.get<TopTopic[]>(`${environment.apiUrl}/kafka/top-topics?period=${period}`);
  }

  getConsumerLag(period: PeriodOption): Observable<ConsumerLagData> {
    return this.http.get<ConsumerLagData>(`${environment.apiUrl}/kafka/consumer-lag?period=${period}`);
  }

  getThroughputChart(period: PeriodOption): Observable<ThroughputChartData> {
    return this.http.get<ThroughputChartData>(`${environment.apiUrl}/kafka/throughput-chart?period=${period}`);
  }
}
