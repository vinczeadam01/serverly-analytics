import { Injectable, signal, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PeriodService, PeriodOption } from '../../../shared/services/period.service';
import { environment } from '../../../../environments/environment';

export interface KafkaBarItem { label: string; value: number }
export type KafkaChartType = 'messages' | 'bytes' | 'lag';

export interface KafkaAnalyticsData {
  kpis: {
    totalMessages: number;
    totalBytesIn: string;
    totalBytesOut: string;
    avgLag: number;
  };
  timeSeries: {
    messages: { timestamp: string; value: number }[];
    bytes: { timestamp: string; value: number; breakdown?: { in: number; out: number } }[];
    lag: { timestamp: string; value: number }[];
  };
  topTopics: KafkaBarItem[];
  consumerLag: KafkaBarItem[];
}

@Injectable({ providedIn: 'root' })
export class KafkaAnalyticsService {
  private _data = signal<KafkaAnalyticsData | null>(null);
  private _loading = signal<boolean>(false);
  private _error = signal<string | null>(null);

  readonly data = this._data.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  constructor(private http: HttpClient, private periodService: PeriodService) {
    effect(() => {
      const p = this.periodService.selectedPeriod();
      this.load(p);
    });
  }

  load(period?: PeriodOption) {
    const p = period || this.periodService.getPeriod();
    this._loading.set(true);
    this._error.set(null);
    const url = `${environment.apiUrl}/analytics/kafka?period=${p}`;
    this.http.get<KafkaAnalyticsData>(url).subscribe({
      next: (d) => {
        this._data.set(d);
        this._loading.set(false);
      },
      error: (err) => {
        this._error.set('Failed to load Kafka analytics');
        this._loading.set(false);
      }
    });
  }

  refresh() { this.load(); }


  private series(period: PeriodOption, type: KafkaChartType) {
    const out: any[] = [];
    const now = Date.now();
    let intervals = 24, step = 60*60*1000;
    switch (period) {
      case '15m': intervals=15; step=60*1000; break;
      case '1h': intervals=24; step=2.5*60*1000; break;
      case '7d': intervals=28; step=6*60*60*1000; break;
      case '30d': intervals=30; step=24*60*60*1000; break;
    }
    for (let i = intervals - 1; i >= 0; i--) {
      const ts = new Date(now - i*step).toISOString();
      const hour = new Date(ts).getHours();
      const biz = hour >= 9 && hour <= 17 ? 1.4 : 0.7;
      const rnd = 0.85 + Math.random()*0.3;
      if (type === 'messages') {
        out.push({ timestamp: ts, value: Math.floor(50_000 * biz * rnd) });
      } else if (type === 'lag') {
        out.push({ timestamp: ts, value: Math.floor(80 * (biz>1?1.2:0.8) * rnd) });
      } else {
        const inbound = Math.floor(800 * biz * rnd); // MB
        const outbound = Math.floor(760 * biz * rnd);
        out.push({ timestamp: ts, value: inbound+outbound, breakdown: { in: inbound, out: outbound } });
      }
    }
    return out;
  }
}

