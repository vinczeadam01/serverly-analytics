import { Component, OnInit, OnDestroy, ViewChildren, QueryList, signal, computed, effect, EffectRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType as ChartJsType } from 'chart.js';
import { ChartConfigService } from '../../services/chart-config.service';
import { PeriodSelectorComponent } from '../common/period-selector/period-selector.component';
import { ThemeService } from '../../services/theme';
import { VpsViewService, VpsMetricType } from '../../services/vps-view.service';

@Component({
  selector: 'app-vps-view',
  standalone: true,
  imports: [CommonModule, RouterModule, BaseChartDirective, PeriodSelectorComponent],
  templateUrl: './vps-view.component.html',
  styleUrl: './vps-view.component.scss'
})
export class VpsViewComponent implements OnInit, OnDestroy {
  @ViewChildren(BaseChartDirective) charts?: QueryList<BaseChartDirective>;

  hostname: string | null = null;

  lineChartType: ChartJsType = 'line';
  lineChartOptions!: ChartConfiguration['options'];

  private themeEffectRef?: EffectRef;

  cpuChartData = computed(() => {
    const data = this.viewService.data();
    if (!data) return { labels: [], datasets: [] };
    const series = data.timeSeries.cpu;
    const labels = series.map(p => new Date(p.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    const single = this.chartConfig.palette(1)[0];
    return {
      labels,
      datasets: [{ label: 'CPU %', data: series.map(p => p.value), borderColor: single.border, backgroundColor: single.background, fill: true, tension: 0.4 }]
    };
  });

  memoryChartData = computed(() => {
    const data = this.viewService.data();
    if (!data) return { labels: [], datasets: [] };
    const series = data.timeSeries.memory;
    const labels = series.map(p => new Date(p.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    const single = this.chartConfig.palette(1)[0];
    return {
      labels,
      datasets: [{ label: 'Memory %', data: series.map(p => p.value), borderColor: single.border, backgroundColor: single.background, fill: true, tension: 0.4 }]
    };
  });

  networkChartData = computed(() => {
    const data = this.viewService.data();
    if (!data) return { labels: [], datasets: [] };
    const series = data.timeSeries.network;
    const labels = series.map(p => new Date(p.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    const keys = series.length > 0 && series[0].breakdown ? Object.keys(series[0].breakdown!) : ['inbound','outbound'];
    const colors = this.chartConfig.palette(keys.length);
    const datasets = keys.map((k, i) => ({
      label: k === 'inbound' ? 'Inbound (Mbps)' : 'Outbound (Mbps)',
      data: series.map(p => p.breakdown?.[k] || 0),
      borderColor: colors[i].border,
      backgroundColor: colors[i].background,
      fill: false,
      tension: 0.4
    }));
    return { labels, datasets };
  });

  diskChartData = computed(() => {
    const data = this.viewService.data();
    if (!data) return { labels: [], datasets: [] };
    const series = data.timeSeries.disk;
    const labels = series.map(p => new Date(p.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    const keys = series.length > 0 && series[0].breakdown ? Object.keys(series[0].breakdown!) : ['read','write'];
    const colors = this.chartConfig.palette(keys.length);
    const datasets = keys.map((k, i) => ({
      label: k === 'read' ? 'Read (MB/s)' : 'Write (MB/s)',
      data: series.map(p => p.breakdown?.[k] || 0),
      borderColor: colors[i].border,
      backgroundColor: colors[i].background,
      fill: false,
      tension: 0.4
    }));
    return { labels, datasets };
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public viewService: VpsViewService,
    private themeService: ThemeService,
    private chartConfig: ChartConfigService
  ) {
    this.themeEffectRef = effect(() => { void this.themeService.themeSignal()(); this.updateTheme(); });
    this.lineChartOptions = this.chartConfig.lineOptions();
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.hostname = params['host'];
      if (this.hostname) this.viewService.load(this.hostname);
    });
  }
  ngOnDestroy(): void { this.themeEffectRef?.destroy(); }

  goBack() { this.router.navigate(['/vps']); }
  onRefresh() { this.viewService.refresh(); }

  private updateTheme() {
    this.lineChartOptions = this.chartConfig.lineOptions();
    setTimeout(() => this.charts?.forEach(c => c.update()), 50);
  }
}
