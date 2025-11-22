import { Component, OnInit, OnDestroy, ViewChild, signal, computed, effect, EffectRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType as ChartJsType } from 'chart.js';
import { ThemeService } from '../../../../shared/services/theme';
import { ChartConfigService } from '../../../../shared/services/chart-config.service';
import { PeriodSelectorComponent } from '../../../../shared/components/period-selector/period-selector.component';
import { DnsRepository } from '../../repositories/dns.repository';
import { PeriodService, PeriodOption } from '../../../../shared/services/period.service';
import { DnsZone, QueryChartData, TopDomain, RecordTypesData, ResponseTimeChartData } from '../../models/dns.models';
import { forkJoin } from 'rxjs';

export type ChartType = 'query' | 'recordTypes' | 'responseTime';

@Component({
  selector: 'app-dns-view',
  standalone: true,
  imports: [CommonModule, RouterModule, BaseChartDirective, PeriodSelectorComponent],
  templateUrl: './dns-view.component.html',
  styleUrl: './dns-view.component.scss'
})
export class DnsViewComponent implements OnInit, OnDestroy {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  private dnsRepo = inject(DnsRepository);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private themeService = inject(ThemeService);
  private chartConfig = inject(ChartConfigService);
  private periodService = inject(PeriodService);

  zoneName: string | null = null;
  selectedChartType = signal<ChartType>('query');

  // State signals
  zone = signal<DnsZone | null>(null);
  queryChartData = signal<QueryChartData | null>(null);
  topDomains = signal<TopDomain[]>([]);
  recordTypesData = signal<RecordTypesData | null>(null);
  responseTimeData = signal<ResponseTimeChartData | null>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  // Line chart configuration
  lineChartType: ChartJsType = 'line';
  lineChartOptions!: ChartConfiguration['options'];

  // Bar chart configuration
  barChartType: ChartJsType = 'bar';
  barChartOptions!: ChartConfiguration['options'];
  pieChartType: ChartJsType = 'pie';
  pieChartOptions!: ChartConfiguration['options'];

  private themeEffectRef?: EffectRef;
  private periodEffectRef?: EffectRef;

  // Computed chart data based on selected type
  lineChartData = computed(() => {
    const type = this.selectedChartType();

    if (type === 'query') {
      const data = this.queryChartData();
      if (!data?.data) return { labels: [], datasets: [] };

      const labels = data.data.map(point => {
        const date = new Date(point.timestamp);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      });

      const single = this.chartConfig.palette(1)[0];
      return {
        labels,
        datasets: [{
          label: 'Queries',
          data: data.data.map(point => point.value),
          borderColor: single.border,
          backgroundColor: single.background,
          fill: true,
          tension: 0.4
        }]
      };
    } else if (type === 'responseTime') {
      const data = this.responseTimeData();
      if (!data?.data) return { labels: [], datasets: [] };

      const labels = data.data.map(point => {
        const date = new Date(point.timestamp);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      });

      const single = this.chartConfig.palette(1)[0];
      return {
        labels,
        datasets: [{
          label: 'Response Time (ms)',
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

  // Pie chart data for record types
  recordTypesPieData = computed(() => {
    const data = this.recordTypesData();
    if (!data?.recordTypes) return { labels: [], datasets: [] };

    const colors = this.chartConfig.palette(data.recordTypes.length);
    return {
      labels: data.recordTypes.map(rt => rt.type),
      datasets: [{
        data: data.recordTypes.map(rt => rt.count),
        backgroundColor: colors.map(c => c.background),
        borderColor: colors.map(c => c.border),
        borderWidth: 1
      }]
    };
  });

  // Bar chart data for top domains
  topDomainsChartData = computed(() => {
    const domains = this.topDomains();
    const top10 = domains.slice(0, 10);
    return {
      labels: top10.map(d => d.domain),
      datasets: [{
        data: top10.map(d => d.queries),
        backgroundColor: '#60A5FA',
        borderColor: '#60A5FA',
        borderWidth: 0,
        borderRadius: 5
      }]
    };
  });

  constructor() {
    // React to global theme changes via ThemeService signal
    this.themeEffectRef = effect(() => {
      void this.themeService.themeSignal()();
      this.updateChartTheme();
    });

    // React to period changes
    this.periodEffectRef = effect(() => {
      const period = this.periodService.selectedPeriod();
      if (this.zoneName) {
        this.loadZoneData(this.zoneName, period);
      }
    });

    // Initialize chart options
    this.lineChartOptions = this.chartConfig.lineOptions();
    this.barChartOptions = this.chartConfig.barOptions({ horizontal: true });
    this.pieChartOptions = this.chartConfig.pieOptions();
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.zoneName = params['zoneName'];
      if (this.zoneName) {
        this.loadZoneData(this.zoneName);
      }
    });
  }

  ngOnDestroy(): void {
    this.themeEffectRef?.destroy();
    this.periodEffectRef?.destroy();
  }

  loadZoneData(zoneName: string, period?: PeriodOption): void {
    const selectedPeriod = period || this.periodService.getPeriod();
    this.loading.set(true);
    this.error.set(null);

    // Load all data in parallel using forkJoin
    forkJoin({
      zone: this.dnsRepo.getById(zoneName),
      queryChart: this.dnsRepo.getQueryChart(zoneName, selectedPeriod),
      topDomains: this.dnsRepo.getTopDomains(zoneName, selectedPeriod),
      recordTypes: this.dnsRepo.getRecordTypes(zoneName, selectedPeriod),
      responseTime: this.dnsRepo.getResponseTimeChart(zoneName, selectedPeriod)
    }).subscribe({
      next: (result) => {
        this.zone.set(result.zone);
        this.queryChartData.set(result.queryChart);
        this.topDomains.set(result.topDomains);
        this.recordTypesData.set(result.recordTypes);
        this.responseTimeData.set(result.responseTime);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load DNS zone data');
        this.loading.set(false);
        console.error('Error loading DNS zone data:', err);
      }
    });
  }

  selectChartType(type: ChartType): void {
    this.selectedChartType.set(type);
    this.chart?.update();
  }

  onRefresh(): void {
    if (this.zoneName) {
      this.loadZoneData(this.zoneName);
    }
  }

  goBack(): void {
    this.router.navigate(['/dns']);
  }

  private updateChartTheme(): void {
    this.lineChartOptions = this.chartConfig.lineOptions();
    this.barChartOptions = this.chartConfig.barOptions({ horizontal: true });
    this.pieChartOptions = this.chartConfig.pieOptions();
    setTimeout(() => {
      this.chart?.update();
    }, 50);
  }
}
