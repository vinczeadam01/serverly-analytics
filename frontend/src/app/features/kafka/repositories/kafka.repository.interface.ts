import { Observable } from 'rxjs';
import { PeriodOption } from '../../../shared/services/period.service';
import { MessagesChartData, TopTopic, ConsumerLagData, ThroughputChartData } from '../models/kafka.models';

export interface IKafkaRepository {
  getMessagesChart(period: PeriodOption): Observable<MessagesChartData>;
  getTopTopics(period: PeriodOption): Observable<TopTopic[]>;
  getConsumerLag(period: PeriodOption): Observable<ConsumerLagData>;
  getThroughputChart(period: PeriodOption): Observable<ThroughputChartData>;
}
