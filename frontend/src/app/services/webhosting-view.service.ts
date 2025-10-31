import { Injectable, signal, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PeriodService, PeriodOption } from './period.service';
import { environment } from '../../environments/environment';

export type WebChartType = 'requests' | 'bandwidth' | 'responseTime';

export interface TimeSeriesPoint {
  timestamp: string;
  value: number;
  breakdown?: { [key: string]: number };
}

export interface WebhostingViewData {
  site: { domain: string };
  kpis: {
    totalRequests: number;
    totalBandwidth: string;
    avgResponseMs: number;
    errorRate: number;
  };
  timeSeries: {
    requests: TimeSeriesPoint[];
    bandwidth: TimeSeriesPoint[];
    responseTime: TimeSeriesPoint[];
  };
  topMethods: { labels: string[]; datasets: any[] };
  statusCodes: { labels: string[]; datasets: any[] };
}

@Injectable({ providedIn: 'root' })
export class WebhostingViewService {
  private _data = signal<WebhostingViewData | null>(null);
  private _loading = signal<boolean>(false);
  private _error = signal<string | null>(null);
  private _site = signal<string | null>(null);

  readonly data = this._data.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  constructor(private http: HttpClient, private periodService: PeriodService) {
    effect(() => {
      const period = this.periodService.selectedPeriod();
      const site = this._site();
      if (site) this.loadSiteData(site, period);
    });
  }

  loadSiteData(site: string, period?: PeriodOption) {
    this._site.set(site);
    const selected = period || this.periodService.getPeriod();
    this._loading.set(true);
    this._error.set(null);

    const url = `${environment.apiUrl}/analytics/webhosting/${encodeURIComponent(site)}?period=${selected}`;
    this.http.get<WebhostingViewData>(url).subscribe({
      next: (data) => { this._data.set(data); this._loading.set(false); },
      error: () => {
        setTimeout(() => {
          this._data.set(this.generateDemoData(site, selected));
          this._loading.set(false);
          this._error.set(null);
        }, 800);
      }
    });
  }

  refresh(): void {
    const site = this._site();
    if (site) this.loadSiteData(site);
  }

  private generateDemoData(site: string, period: PeriodOption): WebhostingViewData {
    const kpis = {
      totalRequests: 1_245_678,
      totalBandwidth: '2.8 TB',
      avgResponseMs: 185,
      errorRate: 2.3,
    };

    return {
      site: { domain: site },
      kpis,
      timeSeries: {
        requests: this.generateSeries(period, 'requests'),
        bandwidth: this.generateSeries(period, 'bandwidth'),
        responseTime: this.generateSeries(period, 'responseTime'),
      },
      topMethods: this.generateMethodsBar(),
      statusCodes: this.generateStatusCodesBar(),
    };
  }

  private generateSeries(period: PeriodOption, type: WebChartType): TimeSeriesPoint[] {
    const pts: TimeSeriesPoint[] = [];
    const now = new Date();
    let intervals = 24;
    let stepMs = 60 * 60 * 1000; // 1h default
    switch (period) {
      case '15m': intervals = 15; stepMs = 60 * 1000; break;
      case '1h': intervals = 24; stepMs = 2.5 * 60 * 1000; break;
      case '7d': intervals = 28; stepMs = 6 * 60 * 60 * 1000; break;
      case '30d': intervals = 30; stepMs = 24 * 60 * 60 * 1000; break;
      case '24h': default: intervals = 24; stepMs = 60 * 60 * 1000; break;
    }

    for (let i = intervals - 1; i >= 0; i--) {
      const t = new Date(now.getTime() - i * stepMs);
      const hour = t.getHours();
      const biz = (hour >= 9 && hour <= 17) ? 1.5 : 0.7;
      const rnd = 0.8 + Math.random() * 0.4;

      if (type === 'requests') {
        const value = Math.floor(50_000 * biz * rnd);
        pts.push({ timestamp: t.toISOString(), value });
      } else if (type === 'responseTime') {
        const value = Math.floor(120 * rnd * (biz > 1 ? 1.2 : 0.9));
        pts.push({ timestamp: t.toISOString(), value });
      } else {
        const inbound = Math.floor(500 * biz * rnd); // MB
        const outbound = Math.floor(350 * biz * rnd); // MB
        pts.push({ timestamp: t.toISOString(), value: inbound + outbound, breakdown: { inbound, outbound } });
      }
    }

    return pts;
  }

  private generateMethodsBar() {
    const labels = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'];
    const values = [70, 18, 4, 3, 2, 3];
    return { labels, datasets: [{ data: values, backgroundColor: '#60A5FA', borderColor: '#60A5FA', borderWidth: 0, borderRadius: 5 }] };
  }

  private generateStatusCodesBar() {
    const labels = ['200', '301', '404', '500'];
    const values = [82, 8, 7, 3];
    return { labels, datasets: [{ data: values, backgroundColor: '#A78BFA', borderColor: '#A78BFA', borderWidth: 0, borderRadius: 5 }] };
  }
}
