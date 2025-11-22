import { Component, ViewChild, signal, computed, effect, EffectRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType as ChartJsType } from 'chart.js';
import { PeriodSelectorComponent } from '../../../../shared/components/period-selector/period-selector.component';
import { KafkaAnalyticsService, KafkaChartType } from '../../services/kafka-analytics.service';
import { ChartConfigService } from '../../../../shared/services/chart-config.service';
import { ThemeService } from '../../../../shared/services/theme';

@Component({
  selector: 'app-kafka',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, PeriodSelectorComponent],
  templateUrl: './kafka.component.html',
  styleUrl: './kafka.component.scss'
})
export class KafkaComponent {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  lineChartType: ChartJsType = 'line';
  barChartType: ChartJsType = 'bar';
  lineChartOptions!: ChartConfiguration['options'];
  barChartOptions!: ChartConfiguration['options'];
  selected = signal<KafkaChartType>('messages');
  private themeEffectRef?: EffectRef;

  constructor(
    public service: KafkaAnalyticsService,
    private chartConfig: ChartConfigService,
    private themeService: ThemeService,
  ) {
    this.lineChartOptions = this.chartConfig.lineOptions();
    this.barChartOptions = this.chartConfig.barOptions({ horizontal: true });
    this.themeEffectRef = effect(() => { void this.themeService.themeSignal()(); this.updateTheme(); });
  }

  ngOnDestroy(): void { this.themeEffectRef?.destroy(); }

  lineChartData = computed(() => {
    const data = this.service.data();
    if (!data) return { labels: [], datasets: [] };
    const type = this.selected();
    const series: any[] = (data.timeSeries as any)[type] || [];
    const labels = series.map(p => new Date(p.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    const datasets: any[] = [];
    if (series.length > 0 && series[0].breakdown) {
      const keys = Object.keys(series[0].breakdown);
      const colors = this.chartConfig.palette(keys.length);
      keys.forEach((k, i) => datasets.push({ label: k === 'in' ? 'Bytes In (MB)' : 'Bytes Out (MB)', data: series.map((p: any) => p.breakdown?.[k] || 0), borderColor: colors[i].border, backgroundColor: colors[i].background, fill: false, tension: 0.4 }));
    } else {
      const single = this.chartConfig.palette(1)[0];
      const label = type === 'messages' ? 'Messages/s' : 'Consumer Lag';
      datasets.push({ label, data: series.map((p: any) => p.value), borderColor: single.border, backgroundColor: single.background, fill: true, tension: 0.4 });
    }
    return { labels, datasets };
  });

  topTopicsData = computed(() => {
    const list = this.service.data()?.topTopics || [];
    return {
      labels: list.slice(0,10).map(i => i.label),
      datasets: [{ data: list.slice(0,10).map(i => i.value), backgroundColor: '#60A5FA', borderColor: '#60A5FA', borderWidth: 0, borderRadius: 5 }]
    };
  });

  consumerLagData = computed(() => {
    const list = this.service.data()?.consumerLag || [];
    return {
      labels: list.slice(0,10).map(i => i.label),
      datasets: [{ data: list.slice(0,10).map(i => i.value), backgroundColor: '#A78BFA', borderColor: '#A78BFA', borderWidth: 0, borderRadius: 5 }]
    };
  });

  select(type: KafkaChartType) { this.selected.set(type); this.chart?.update(); }
  onRefresh() { this.service.refresh(); }
  private updateTheme() { this.lineChartOptions = this.chartConfig.lineOptions(); this.barChartOptions = this.chartConfig.barOptions({ horizontal: true }); setTimeout(() => this.chart?.update(), 50); }
}
