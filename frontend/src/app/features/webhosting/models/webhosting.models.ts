export interface WebhostingAccount {
  id: string;
  domain: string;
  status: string;
  totalRequests: number;
  bandwidth: string;
}

export interface ChartDataPoint {
  timestamp: string;
  value: number;
}

export interface TrafficChartData {
  data: ChartDataPoint[];
}

export interface TopPage {
  url: string;
  requests: number;
  avgResponseTime: number;
}

export interface StatusCodesData {
  statusCodes: StatusCode[];
}

export interface StatusCode {
  code: number;
  count: number;
  percentage: number;
}

export interface BandwidthChartData {
  data: ChartDataPoint[];
}
