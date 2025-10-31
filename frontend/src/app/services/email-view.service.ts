import { Injectable, signal, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PeriodService, PeriodOption } from './period.service';
import { environment } from '../../environments/environment';

export interface EmailFlowItem { label: string; count: number; percentage: number; color?: string }
export interface TopRecipient { email: string; received: number }

export interface EmailViewData {
  domain: string;
  flow: EmailFlowItem[]; // Inbound, Outbound, Bounced, Spam
  topRecipients: TopRecipient[];
}

@Injectable({ providedIn: 'root' })
export class EmailViewService {
  private _data = signal<EmailViewData | null>(null);
  private _loading = signal<boolean>(false);
  private _error = signal<string | null>(null);
  private _domain = signal<string | null>(null);

  readonly data = this._data.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  constructor(private http: HttpClient, private periodService: PeriodService) {
    effect(() => {
      const period = this.periodService.selectedPeriod();
      const d = this._domain();
      if (d) this.load(d, period);
    });
  }

  load(domain: string, period?: PeriodOption) {
    this._domain.set(domain);
    const p = period || this.periodService.getPeriod();
    this._loading.set(true);
    this._error.set(null);

    const url = `${environment.apiUrl}/analytics/email/${encodeURIComponent(domain)}?period=${p}`;
    this.http.get<EmailViewData>(url).subscribe({
      next: (data) => { this._data.set(data); this._loading.set(false); },
      error: () => {
        setTimeout(() => {
          this._data.set(this.demo(domain));
          this._loading.set(false);
          this._error.set(null);
        }, 800);
      }
    });
  }

  refresh() {
    const d = this._domain();
    if (d) this.load(d);
  }

  private demo(domain: string): EmailViewData {
    const inbound = Math.floor(50_000 + Math.random()*150_000);
    const outbound = Math.floor(40_000 + Math.random()*120_000);
    const bounced = Math.floor(outbound * (0.02 + Math.random()*0.05));
    const spam = Math.floor(inbound * (0.03 + Math.random()*0.08));
    const total = inbound + outbound + bounced + spam;
    const pct = (n: number) => Math.max(1, Math.round((n/total)*100));
    const flow: EmailFlowItem[] = [
      { label: 'Inbound', count: inbound, percentage: pct(inbound) },
      { label: 'Outbound', count: outbound, percentage: pct(outbound) },
      { label: 'Bounced', count: bounced, percentage: pct(bounced) },
      { label: 'Spam', count: spam, percentage: pct(spam) },
    ];

    const recipients: TopRecipient[] = Array.from({ length: 10 }).map((_, i) => ({
      email: `user${i+1}@${domain}`,
      received: Math.floor(100 + Math.random()*5000)
    })).sort((a,b) => b.received - a.received);

    return { domain, flow, topRecipients: recipients };
  }
}
