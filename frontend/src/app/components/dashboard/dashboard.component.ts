import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType as ChartJsType } from 'chart.js';
import { ChartConfigService } from '../../services/chart-config.service';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { PeriodSelectorComponent } from '../common/period-selector/period-selector.component';
import { DashboardAnalyticsService } from '../../services/dashboard-analytics.service';
import { WebhostingAnalyticsService } from '../../services/webhosting-analytics.service';
import { DnsListService } from '../../services/dns-list.service';
import { EmailAnalyticsService } from '../../services/email-analytics.service';
import { VpsAnalyticsService } from '../../services/vps-analytics.service';
import { KafkaAnalyticsService } from '../../services/kafka-analytics.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, PeriodSelectorComponent, BaseChartDirective],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  username = '';
  message = '';
  loading = false;
  barChartType: ChartJsType = 'bar';
  barChartOptions!: ChartConfiguration['options'];
  lineChartType: ChartJsType = 'line';
  lineChartOptions!: ChartConfiguration['options'];

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient,
    public analyticsService: DashboardAnalyticsService,
    public webhosting: WebhostingAnalyticsService,
    public dns: DnsListService,
    public email: EmailAnalyticsService,
    public vps: VpsAnalyticsService,
    public kafka: KafkaAnalyticsService,
    private chartConfig: ChartConfigService,
  ) {}

  ngOnInit(): void {
    this.loadProfile();
    this.barChartOptions = this.chartConfig.barOptions({ horizontal: true });
    this.lineChartOptions = this.chartConfig.lineOptions();
  }

  loadProfile(): void {
    this.loading = true;
    this.http.get<any>(`${environment.apiUrl}/users/profile`).subscribe({
      next: (response) => {
        this.username = response.username;
        this.message = response.message;
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load profile', error);
        this.loading = false;
      }
    });
  }

  onRefresh(): void {
    this.analyticsService.refresh();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  kafkaTopTopicsData() {
    const list = this.kafka.data()?.topTopics || [];
    return {
      labels: list.slice(0, 5).map(i => i.label),
      datasets: [{ data: list.slice(0, 5).map(i => i.value), backgroundColor: '#60A5FA', borderColor: '#60A5FA', borderWidth: 0, borderRadius: 5 }]
    } as any;
  }

  dnsTopDomainsData() {
    const list: any[] = (this.dns.data() as any)?.topDomains || [];
    return {
      labels: list.slice(0, 5).map(i => i.domain),
      datasets: [{ data: list.slice(0, 5).map(i => i.queries), backgroundColor: '#A78BFA', borderColor: '#A78BFA', borderWidth: 0, borderRadius: 5 }]
    } as any;
  }

  webTopPagesData() {
    const pages: any[] = (this.webhosting.data() as any)?.topPages || [];
    return {
      labels: pages.slice(0, 5).map(p => p.url),
      datasets: [{ data: pages.slice(0, 5).map(p => p.requests), backgroundColor: '#60A5FA', borderColor: '#60A5FA', borderWidth: 0, borderRadius: 5 }]
    } as any;
  }

  kafkaMessagesLineData() {
    const series: any[] = (this.kafka.data() as any)?.timeSeries?.messages || [];
    const labels = series.map(p => new Date(p.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    const single = this.chartConfig.palette(1)[0];
    return {
      labels,
      datasets: [{ label: 'Messages/s', data: series.map(p => p.value), borderColor: single.border, backgroundColor: single.background, fill: true, tension: 0.4 }]
    } as any;
  }
}
