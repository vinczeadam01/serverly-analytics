export interface DashboardAnalyticsData {
  totalRequests: number;
  errorRate: number;
  avgResponseTime: number;
  activeHosts: number;
  serviceBreakdown: ServiceBreakdown[];
  recentAlerts: RecentAlert[];
  topHosts: TopHost[];
}

export interface ServiceBreakdown {
  service: string;
  requests: number;
  percentage: number;
}

export interface RecentAlert {
  type: string;
  message: string;
  timestamp: string;
}

export interface TopHost {
  host: string;
  service: string;
  totalRequests: number;
  errorRate: number;
  avgLatency: number;
  status: string;
}
