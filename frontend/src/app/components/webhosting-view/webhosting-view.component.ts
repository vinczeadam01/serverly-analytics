import { Component, OnInit, OnDestroy, ViewChild, signal, computed, effect, EffectRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType as ChartJsType } from 'chart.js';
import { ChartConfigService } from '../../services/chart-config.service';
import { PeriodSelectorComponent } from '../common/period-selector/period-selector.component';
import { ThemeService } from '../../services/theme';
import { WebhostingViewService, WebChartType } from '../../services/webhosting-view.service';

@Component({
  selector: 'app-webhosting-view',
  standalone: true,
  imports: [CommonModule, RouterModule, BaseChartDirective, PeriodSelectorComponent],
  templateUrl: './webhosting-view.component.html',
  styleUrl: './webhosting-view.component.scss'
})
export class WebhostingViewComponent implements OnInit, OnDestroy {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  siteDomain: string | null = null;
  selectedChartType = signal<WebChartType>('requests');

  // charts config
  lineChartType: ChartJsType = 'line';
  lineChartOptions!: ChartConfiguration['options'];
  barChartType: ChartJsType = 'bar';
  barChartOptions!: ChartConfiguration['options'];

  private themeEffectRef?: EffectRef;

  // Computed line chart data based on selected type
  lineChartData = computed(() => {
    const data = this.viewService.data();
    if (!data) return { labels: [], datasets: [] };

    const type = this.selectedChartType();
    const series = data.timeSeries[type];

    const labels = series.map(p => {
      const d = new Date(p.timestamp);
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    });

    const datasets: any[] = [];

    if (series.length > 0 && series[0].breakdown) {
      const keys = Object.keys(series[0].breakdown!);
      const colors = this.chartConfig.palette(keys.length);
      keys.forEach((key, idx) => {
        datasets.push({
          label: key,
          data: series.map(p => p.breakdown?.[key] || 0),
          borderColor: colors[idx].border,
          backgroundColor: colors[idx].background,
          fill: false,
          tension: 0.4,
        });
      });
    } else {
      const single = this.chartConfig.palette(1)[0];
      const label = type === 'requests' ? 'Requests' : type === 'responseTime' ? 'Response Time (ms)' : 'Bandwidth';
      datasets.push({
        label,
        data: series.map(p => p.value),
        borderColor: single.border,
        backgroundColor: single.background,
        fill: true,
        tension: 0.4,
      });
    }

    return { labels, datasets };
  });

  methodsChartData = computed(() => this.viewService.data()?.topMethods || { labels: [], datasets: [] });
  statusCodesChartData = computed(() => this.viewService.data()?.statusCodes || { labels: [], datasets: [] });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public viewService: WebhostingViewService,
    private themeService: ThemeService,
    private chartConfig: ChartConfigService
  ) {
    this.themeEffectRef = effect(() => {
      void this.themeService.themeSignal()();
      this.updateChartTheme();
    });

    this.lineChartOptions = this.chartConfig.lineOptions();
    this.barChartOptions = this.chartConfig.barOptions({ horizontal: true });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.siteDomain = params['site'];
      if (this.siteDomain) this.viewService.loadSiteData(this.siteDomain);
    });
  }

  ngOnDestroy(): void {
    this.themeEffectRef?.destroy();
  }

  goBack(): void {
    this.router.navigate(['/webhosting']);
  }

  onRefresh(): void {
    this.viewService.refresh();
  }

  selectChartType(type: WebChartType): void {
    this.selectedChartType.set(type);
    this.chart?.update();
  }

  private updateChartTheme(): void {
    this.lineChartOptions = this.chartConfig.lineOptions();
    this.barChartOptions = this.chartConfig.barOptions({ horizontal: true });
    setTimeout(() => this.chart?.update(), 50);
  }
}

