export interface VpsInstance {
  id: string;
  instance: string;
  cpuUsage: number;
  memory: string;
  diskUsage: string;
  network: string;
  status: string;
}

export interface ChartDataPoint {
  timestamp: string;
  value: number;
}

export interface CpuChartData {
  data: ChartDataPoint[];
}

export interface MemoryChartData {
  data: ChartDataPoint[];
}

export interface DiskChartData {
  data: ChartDataPoint[];
}

export interface NetworkChartData {
  data: ChartDataPoint[];
}

export interface VpsAnalyticsData {
  totalInstances: number;
  avgCpuUsage: number;
  avgMemoryUsage: number;
  avgDiskUsage: number;
  resourceUtilization: ResourceUtilization[];
  topVpsByUsage: TopVps[];
  instances: VpsInstanceMetrics[];
}

export interface ResourceUtilization {
  category: string;
  count: number;
  percentage: number;
}

export interface TopVps {
  instance: string;
  cpu: number;
  memory: number;
}

export interface VpsInstanceMetrics {
  instance: string;
  cpuUsage: number;
  memory: string;
  diskUsage: string;
  network: string;
  status: string;
}
