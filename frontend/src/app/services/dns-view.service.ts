import { Injectable, signal, computed, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PeriodService, PeriodOption } from './period.service';
import { environment } from '../../environments/environment';
import { DnsZone } from './dns-list.service';

export interface TimeSeriesPoint {
  timestamp: string; // ISO format
  value: number;
  breakdown?: { [key: string]: number }; // e.g., {A: 100, AAAA: 50}
}

export interface BarChartItem {
  label: string;
  value: number;
  percentage: number;
}

export type ChartType = 'recordType' | 'recordName' | 'sourceIp' | 'targetIp';

export interface DnsZoneViewData {
  zone: DnsZone;
  timeSeries: {
    recordType: TimeSeriesPoint[];
    recordName: TimeSeriesPoint[];
    sourceIp: TimeSeriesPoint[];
    targetIp: TimeSeriesPoint[];
  };
  topRecordTypes: BarChartItem[];
  topRecordNames: BarChartItem[];
  topSourceIps: BarChartItem[];
  topTargetIps: BarChartItem[];
}

@Injectable({
  providedIn: 'root'
})
export class DnsViewService {
  private _data = signal<DnsZoneViewData | null>(null);
  private _loading = signal<boolean>(false);
  private _error = signal<string | null>(null);
  private _zoneName = signal<string | null>(null);

  readonly data = this._data.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  constructor(
    private http: HttpClient,
    private periodService: PeriodService
  ) {
    // Reload data when period changes
    effect(() => {
      const period = this.periodService.selectedPeriod();
      const zoneName = this._zoneName();
      if (zoneName) {
        this.loadZoneData(zoneName, period);
      }
    });
  }

  /**
   * Load zone detail data
   */
  loadZoneData(zoneName: string, period?: PeriodOption): void {
    this._zoneName.set(zoneName);
    const selectedPeriod = period || this.periodService.getPeriod();

    this._loading.set(true);
    this._error.set(null);

    const url = `${environment.apiUrl}/analytics/dns/${encodeURIComponent(zoneName)}?period=${selectedPeriod}`;

    this.http.get<DnsZoneViewData>(url).subscribe({
      next: (data) => {
        this._data.set(data);
        this._loading.set(false);
      },
      error: () => {
        // For demo purposes, simulate latency before demo data
        setTimeout(() => {
          this._data.set(this.generateDemoData(zoneName, selectedPeriod));
          this._error.set(null);
          this._loading.set(false);
        }, 800);
      }
    });
  }

  /**
   * Refresh current zone data
   */
  refresh(): void {
    const zoneName = this._zoneName();
    if (zoneName) {
      this.loadZoneData(zoneName);
    }
  }

  /**
   * Generate comprehensive demo data
   */
  private generateDemoData(zoneName: string, period: PeriodOption): DnsZoneViewData {
    const zone: DnsZone = {
      id: 1,
      zone: zoneName,
      type: 'Master',
      records: 45,
      lastUpdate: new Date().toISOString().slice(0, 16).replace('T', ' '),
      status: 'active',
      queries24h: 125430
    };

    return {
      zone,
      timeSeries: {
        recordType: this.generateTimeSeriesData(period, 'recordType'),
        recordName: this.generateTimeSeriesData(period, 'recordName'),
        sourceIp: this.generateTimeSeriesData(period, 'sourceIp'),
        targetIp: this.generateTimeSeriesData(period, 'targetIp')
      },
      topRecordTypes: this.generateTopRecordTypes(),
      topRecordNames: this.generateTopRecordNames(),
      topSourceIps: this.generateTopSourceIps(),
      topTargetIps: this.generateTopTargetIps()
    };
  }

  /**
   * Generate time-series data based on period
   */
  private generateTimeSeriesData(period: PeriodOption, type: ChartType): TimeSeriesPoint[] {
    const points: TimeSeriesPoint[] = [];
    const now = new Date();
    let intervals: number;
    let intervalMs: number;

    // Determine number of data points and interval based on period
    switch (period) {
      case '15m':
        intervals = 15;
        intervalMs = 60 * 1000; // 1 minute
        break;
      case '1h':
        intervals = 24;
        intervalMs = 2.5 * 60 * 1000; // 2.5 minutes
        break;
      case '24h':
        intervals = 24;
        intervalMs = 60 * 60 * 1000; // 1 hour
        break;
      case '7d':
        intervals = 28;
        intervalMs = 6 * 60 * 60 * 1000; // 6 hours
        break;
      case '30d':
        intervals = 30;
        intervalMs = 24 * 60 * 60 * 1000; // 1 day
        break;
      default:
        intervals = 24;
        intervalMs = 60 * 60 * 1000;
    }

    for (let i = intervals - 1; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * intervalMs);
      const hour = timestamp.getHours();

      // Create realistic patterns (higher during business hours)
      const businessHourMultiplier = (hour >= 9 && hour <= 17) ? 1.5 : 0.7;
      const randomVariation = 0.8 + Math.random() * 0.4;

      let baseValue: number;
      let breakdown: { [key: string]: number } = {};

      switch (type) {
        case 'recordType':
          baseValue = Math.floor(1000 * businessHourMultiplier * randomVariation);
          breakdown = {
            'A': Math.floor(baseValue * 0.65),
            'AAAA': Math.floor(baseValue * 0.20),
            'MX': Math.floor(baseValue * 0.08),
            'TXT': Math.floor(baseValue * 0.07)
          };
          break;
        case 'recordName':
          baseValue = Math.floor(1200 * businessHourMultiplier * randomVariation);
          breakdown = {
            'www': Math.floor(baseValue * 0.40),
            'api': Math.floor(baseValue * 0.30),
            'mail': Math.floor(baseValue * 0.15),
            'cdn': Math.floor(baseValue * 0.15)
          };
          break;
        case 'sourceIp':
          baseValue = Math.floor(800 * businessHourMultiplier * randomVariation);
          breakdown = {
            '192.168.1.1': Math.floor(baseValue * 0.35),
            '192.168.1.100': Math.floor(baseValue * 0.25),
            '10.0.0.5': Math.floor(baseValue * 0.20),
            '10.0.0.10': Math.floor(baseValue * 0.20)
          };
          break;
        case 'targetIp':
          baseValue = Math.floor(900 * businessHourMultiplier * randomVariation);
          breakdown = {
            '8.8.8.8': Math.floor(baseValue * 0.45),
            '8.8.4.4': Math.floor(baseValue * 0.25),
            '1.1.1.1': Math.floor(baseValue * 0.20),
            '1.0.0.1': Math.floor(baseValue * 0.10)
          };
          break;
        default:
          baseValue = Math.floor(1000 * businessHourMultiplier * randomVariation);
      }

      points.push({
        timestamp: timestamp.toISOString(),
        value: baseValue,
        breakdown
      });
    }

    return points;
  }

  /**
   * Generate top record types
   */
  private generateTopRecordTypes(): BarChartItem[] {
    const data = [
      { label: 'A', value: 802455 },
      { label: 'AAAA', value: 222222 },
      { label: 'MX', value: 98765 },
      { label: 'TXT', value: 89234 },
      { label: 'NS', value: 45678 },
      { label: 'CNAME', value: 34567 },
      { label: 'PTR', value: 12345 },
      { label: 'SOA', value: 8901 }
    ];

    const total = data.reduce((sum, item) => sum + item.value, 0);
    return data.map(item => ({
      ...item,
      percentage: Math.round((item.value / total) * 100)
    }));
  }

  /**
   * Generate top record names
   */
  private generateTopRecordNames(): BarChartItem[] {
    const data = [
      { label: 'www', value: 456789 },
      { label: 'api', value: 345678 },
      { label: 'mail', value: 234567 },
      { label: 'cdn', value: 123456 },
      { label: 'ftp', value: 98765 },
      { label: 'blog', value: 87654 },
      { label: 'shop', value: 76543 },
      { label: 'admin', value: 65432 },
      { label: 'staging', value: 54321 },
      { label: 'dev', value: 43210 }
    ];

    const total = data.reduce((sum, item) => sum + item.value, 0);
    return data.map(item => ({
      ...item,
      percentage: Math.round((item.value / total) * 100)
    }));
  }

  /**
   * Generate top source IPs
   */
  private generateTopSourceIps(): BarChartItem[] {
    const data = [
      { label: '192.168.1.1', value: 289456 },
      { label: '192.168.1.100', value: 234567 },
      { label: '10.0.0.5', value: 178934 },
      { label: '10.0.0.10', value: 145678 },
      { label: '192.168.2.50', value: 98765 },
      { label: '172.16.0.10', value: 87654 },
      { label: '10.1.1.20', value: 76543 },
      { label: '192.168.1.200', value: 65432 },
      { label: '10.0.5.15', value: 54321 },
      { label: '172.16.10.5', value: 43210 }
    ];

    const total = data.reduce((sum, item) => sum + item.value, 0);
    return data.map(item => ({
      ...item,
      percentage: Math.round((item.value / total) * 100)
    }));
  }

  /**
   * Generate top target IPs
   */
  private generateTopTargetIps(): BarChartItem[] {
    const data = [
      { label: '8.8.8.8', value: 567890 },
      { label: '8.8.4.4', value: 345678 },
      { label: '1.1.1.1', value: 234567 },
      { label: '1.0.0.1', value: 123456 },
      { label: '9.9.9.9', value: 98765 },
      { label: '208.67.222.222', value: 87654 },
      { label: '208.67.220.220', value: 76543 },
      { label: '64.6.64.6', value: 65432 },
      { label: '64.6.65.6', value: 54321 },
      { label: '77.88.8.8', value: 43210 }
    ];

    const total = data.reduce((sum, item) => sum + item.value, 0);
    return data.map(item => ({
      ...item,
      percentage: Math.round((item.value / total) * 100)
    }));
  }
}
