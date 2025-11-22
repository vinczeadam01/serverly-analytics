import { Component, OnInit, OnDestroy, ViewChild, inject, signal, computed, effect, EffectRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType as ChartJsType } from 'chart.js';
import { ChartConfigService } from '../../../../shared/services/chart-config.service';
import { PeriodSelectorComponent } from '../../../../shared/components/period-selector/period-selector.component';
import { ThemeService } from '../../../../shared/services/theme';
import { WebhostingRepository } from '../../repositories/webhosting.repository';
import { PeriodService, PeriodOption } from '../../../../shared/services/period.service';
import { WebhostingAccount, TrafficChartData, TopPage, StatusCodesData, BandwidthChartData } from '../../models/webhosting.models';
import { forkJoin } from 'rxjs';

export type WebChartType = 'traffic' | 'bandwidth' | 'responseTime';

@Component({
  selector: 'app-webhosting-view',
  standalone: true,
  imports: [CommonModule, RouterModule, BaseChartDirective, PeriodSelectorComponent],
  templateUrl: './webhosting-view.component.html',
  styleUrl: './webhosting-view.component.scss'
})
export class WebhostingViewComponent implements OnInit, OnDestroy {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  private webhostingRepo = inject(WebhostingRepository);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private themeService = inject(ThemeService);
  private chartConfig = inject(ChartConfigService);
  private periodService = inject(PeriodService);

  siteDomain: string | null = null;
  selectedChartType = signal<WebChartType>('traffic');

  // State signals
  account = signal<WebhostingAccount | null>(null);
  trafficChartData = signal<TrafficChartData | null>(null);
  topPages = signal<TopPage[]>([]);
  statusCodesData = signal<StatusCodesData | null>(null);
  bandwidthChartData = signal<BandwidthChartData | null>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  // Chart configuration
  lineChartType: ChartJsType = 'line';
  lineChartOptions!: ChartConfiguration['options'];
  barChartType: ChartJsType = 'bar';
  barChartOptions!: ChartConfiguration['options'];
  pieChartType: ChartJsType = 'pie';
  pieChartOptions!: ChartConfiguration['options'];

  private themeEffectRef?: EffectRef;
  private periodEffectRef?: EffectRef;

  // Computed line chart data based on selected type
  lineChartData = computed(() => {
    const type = this.selectedChartType();

    if (type === 'traffic') {
      const data = this.trafficChartData();
      if (!data?.data) return { labels: [], datasets: [] };

      const labels = data.data.map(point => {
        const date = new Date(point.timestamp);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      });

      const single = this.chartConfig.palette(1)[0];
      return {
        labels,
        datasets: [{
          label: 'Requests',
          data: data.data.map(point => point.value),
          borderColor: single.border,
          backgroundColor: single.background,
          fill: true,
          tension: 0.4
        }]
      };
    } else if (type === 'bandwidth') {
      const data = this.bandwidthChartData();
      if (!data?.data) return { labels: [], datasets: [] };

      const labels = data.data.map(point => {
        const date = new Date(point.timestamp);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      });

      const single = this.chartConfig.palette(1)[0];
      return {
        labels,
        datasets: [{
          label: 'Bandwidth (MB)',
          data: data.data.map(point => point.value),
          borderColor: single.border,
          backgroundColor: single.background,
          fill: true,
          tension: 0.4
        }]
      };
    } else if (type === 'responseTime') {
      const data = this.bandwidthChartData();
      if (!data?.data) return { labels: [], datasets: [] };

      const labels = data.data.map(point => {
        const date = new Date(point.timestamp);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      });

      const single = this.chartConfig.palette(1)[0];
      return {
        labels,
        datasets: [{
          label: 'Response time (ms)',
          data: data.data.map(point => point.value),
          borderColor: single.border,
          backgroundColor: single.background,
          fill: true,
          tension: 0.4
        }]
      };
    }

    return { labels: [], datasets: [] };
  });

  // Pie chart data for status codes
  statusCodesPieData = computed(() => {
    const data = this.statusCodesData();
    if (!data?.statusCodes) return { labels: [], datasets: [] };

    const colors = this.chartConfig.palette(data.statusCodes.length);
    return {
      labels: data.statusCodes.map(sc => sc.code.toString()),
      datasets: [{
        data: data.statusCodes.map(sc => sc.count),
        backgroundColor: colors.map(c => c.background),
        borderColor: colors.map(c => c.border),
        borderWidth: 1
      }]
    };
  });

  // Bar chart data for top pages
  topPagesChartData = computed(() => {
    const pages = this.topPages();
    const top10 = pages.slice(0, 10);
    return {
      labels: top10.map(p => p.url),
      datasets: [{
        data: top10.map(p => p.requests),
        backgroundColor: '#60A5FA',
        borderColor: '#60A5FA',
        borderWidth: 0,
        borderRadius: 5
      }]
    };
  });

  constructor() {
    // React to global theme changes
    this.themeEffectRef = effect(() => {
      void this.themeService.themeSignal()();
      this.updateChartTheme();
    });

    // React to period changes
    this.periodEffectRef = effect(() => {
      const period = this.periodService.selectedPeriod();
      if (this.siteDomain) {
        this.loadSiteData(this.siteDomain, period);
      }
    });

    // Initialize chart options
    this.lineChartOptions = this.chartConfig.lineOptions();
    this.barChartOptions = this.chartConfig.barOptions({ horizontal: true });
    this.pieChartOptions = this.chartConfig.pieOptions();
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.siteDomain = params['site'];
      if (this.siteDomain) {
        this.loadSiteData(this.siteDomain);
      }
    });
  }

  ngOnDestroy(): void {
    this.themeEffectRef?.destroy();
    this.periodEffectRef?.destroy();
  }

  loadSiteData(site: string, period?: PeriodOption): void {
    const selectedPeriod = period || this.periodService.getPeriod();
    this.loading.set(true);
    this.error.set(null);

    // Load all data in parallel using forkJoin
    forkJoin({
      account: this.webhostingRepo.getById(site),
      trafficChart: this.webhostingRepo.getTrafficChart(site, selectedPeriod),
      topPages: this.webhostingRepo.getTopPages(site, selectedPeriod),
      statusCodes: this.webhostingRepo.getStatusCodes(site, selectedPeriod),
      bandwidthChart: this.webhostingRepo.getBandwidthChart(site, selectedPeriod)
    }).subscribe({
      next: (result) => {
        this.account.set(result.account);
        this.trafficChartData.set(result.trafficChart);
        this.topPages.set(result.topPages);
        this.statusCodesData.set(result.statusCodes);
        this.bandwidthChartData.set(result.bandwidthChart);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load webhosting site data');
        this.loading.set(false);
        console.error('Error loading webhosting site data:', err);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/webhosting']);
  }

  onRefresh(): void {
    if (this.siteDomain) {
      this.loadSiteData(this.siteDomain);
    }
  }

  selectChartType(type: WebChartType): void {
    this.selectedChartType.set(type);
    this.chart?.update();
  }

  private updateChartTheme(): void {
    this.lineChartOptions = this.chartConfig.lineOptions();
    this.barChartOptions = this.chartConfig.barOptions({ horizontal: true });
    this.pieChartOptions = this.chartConfig.pieOptions();
    setTimeout(() => this.chart?.update(), 50);
  }
}
