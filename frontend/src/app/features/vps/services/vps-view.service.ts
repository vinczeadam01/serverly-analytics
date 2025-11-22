import { Injectable, signal, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PeriodService, PeriodOption } from '../../../shared/services/period.service';
import { environment } from '../../../../environments/environment';

export type VpsMetricType = 'cpu' | 'network' | 'disk' | 'memory';

export interface TimeSeriesPoint {
  timestamp: string;
  value: number;
  breakdown?: { [key: string]: number };
}

export interface VpsViewData {
  host: string;
  timeSeries: {
    cpu: TimeSeriesPoint[];
    memory: TimeSeriesPoint[];
    network: TimeSeriesPoint[]; // breakdown in/out Mbps
    disk: TimeSeriesPoint[];    // breakdown read/write MB/s
  };
}

@Injectable({ providedIn: 'root' })
export class VpsViewService {
  private _data = signal<VpsViewData | null>(null);
  private _loading = signal<boolean>(false);
  private _error = signal<string | null>(null);
  private _host = signal<string | null>(null);

  readonly data = this._data.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  constructor(private http: HttpClient, private periodService: PeriodService) {
    effect(() => {
      const p = this.periodService.selectedPeriod();
      const h = this._host();
      if (h) this.load(h, p);
    });
  }

  load(host: string, period?: PeriodOption) {
    this._host.set(host);
    const p = period || this.periodService.getPeriod();
    this._loading.set(true);
    this._error.set(null);
    const url = `${environment.apiUrl}/analytics/vps/${encodeURIComponent(host)}?period=${p}`;
    this.http.get<VpsViewData>(url).subscribe({
      next: (d) => {
        this._data.set(d);
        this._loading.set(false);
      },
      error: (err) => {
        this._error.set('Failed to load VPS data');
        this._loading.set(false);
      }
    });
  }

  refresh() { const h = this._host(); if (h) this.load(h); }


  private series(period: PeriodOption, type: VpsMetricType): TimeSeriesPoint[] {
    const points: TimeSeriesPoint[] = [];
    const now = new Date();
    let intervals = 24, step = 60*60*1000;
    switch (period) {
      case '15m': intervals=15; step=60*1000; break;
      case '1h': intervals=24; step=2.5*60*1000; break;
      case '7d': intervals=28; step=6*60*60*1000; break;
      case '30d': intervals=30; step=24*60*60*1000; break;
      default: intervals=24; step=60*60*1000; break;
    }
    for (let i = intervals-1; i >= 0; i--) {
      const t = new Date(now.getTime() - i*step);
      const hour = t.getHours();
      const biz = (hour>=9 && hour<=17) ? 1.2 : 0.8;
      const rnd = 0.85 + Math.random()*0.3;
      if (type === 'cpu') {
        const value = Math.min(100, Math.floor(50 * biz * rnd + 25));
        points.push({ timestamp: t.toISOString(), value });
      } else if (type === 'memory') {
        const value = Math.min(100, Math.floor(55 * biz * rnd + 20));
        points.push({ timestamp: t.toISOString(), value });
      } else if (type === 'network') {
        const inbound = Math.floor(50 * biz * rnd); // Mbps
        const outbound = Math.floor(40 * biz * rnd);
        points.push({ timestamp: t.toISOString(), value: inbound+outbound, breakdown: { inbound, outbound } });
      } else {
        const read = Math.floor(20 * biz * rnd); // MB/s
        const write = Math.floor(15 * biz * rnd);
        points.push({ timestamp: t.toISOString(), value: read+write, breakdown: { read, write } });
      }
    }
    return points;
  }
}
