export interface ChartDataPoint {
  timestamp: string;
  value: number;
}

export interface MessagesChartData {
  data: ChartDataPoint[];
}

export interface TopTopic {
  label: string;
  value: number;
}

export interface ConsumerLagData {
  lags: ConsumerLag[];
}

export interface ConsumerLag {
  consumer: string;
  topic: string;
  lag: number;
}

export interface ThroughputChartData {
  data: ChartDataPoint[];
}

export interface KafkaAnalyticsData {
  topTopics: TopTopic[];
  timeSeries: {
    messages: ChartDataPoint[];
  };
}
