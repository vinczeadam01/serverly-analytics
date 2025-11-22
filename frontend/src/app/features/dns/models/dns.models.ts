export interface DnsZone {
  id: string;
  zone: string;
  status: string;
  totalQueries: number;
  avgResponseTime: number;
}

export interface ChartDataPoint {
  timestamp: string;
  value: number;
}

export interface QueryChartData {
  data: ChartDataPoint[];
}

export interface TopDomain {
  domain: string;
  queries: number;
}

export interface RecordTypesData {
  recordTypes: RecordType[];
}

export interface RecordType {
  type: string;
  count: number;
  percentage: number;
}

export interface ResponseTimeChartData {
  data: ChartDataPoint[];
}
