import { Component, OnInit, OnDestroy, ViewChild, signal, computed, effect, EffectRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType as ChartJsType } from 'chart.js';
import { DnsViewService, ChartType } from '../../services/dns-view.service';
import { ThemeService } from '../../services/theme';
import { ChartConfigService } from '../../services/chart-config.service';
import { PeriodSelectorComponent } from '../common/period-selector/period-selector.component';

@Component({
  selector: 'app-dns-view',
  standalone: true,
  imports: [CommonModule, RouterModule, BaseChartDirective, PeriodSelectorComponent],
  templateUrl: './dns-view.component.html',
  styleUrl: './dns-view.component.scss'
})
export class DnsViewComponent implements OnInit, OnDestroy {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  zoneName: string | null = null;
  selectedChartType = signal<ChartType>('recordType');

  // Line chart configuration
  lineChartType: ChartJsType = 'line';
  lineChartOptions!: ChartConfiguration['options'];

  // Bar chart configuration
  barChartType: ChartJsType = 'bar';
  barChartOptions!: ChartConfiguration['options'];

  private themeEffectRef?: EffectRef;

  // Computed line chart data based on selected type
  lineChartData = computed(() => {
    const data = this.viewService.data();
    if (!data) {
      return { labels: [], datasets: [] };
    }

    const type = this.selectedChartType();
    const timeSeries = data.timeSeries[type];

    const labels = timeSeries.map(point => {
      const date = new Date(point.timestamp);
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    });

    // Create datasets from breakdown if available
    const datasets: any[] = [];

    if (timeSeries.length > 0 && timeSeries[0].breakdown) {
      const breakdownKeys = Object.keys(timeSeries[0].breakdown!);
      const colors = this.chartConfig.palette(breakdownKeys.length);

      breakdownKeys.forEach((key, index) => {
        datasets.push({
          label: key,
          data: timeSeries.map(point => point.breakdown?.[key] || 0),
          borderColor: colors[index].border,
          backgroundColor: colors[index].background,
          fill: false,
          tension: 0.4
        });
      });
    } else {
      const single = this.chartConfig.palette(1)[0];
      datasets.push({
        label: 'Queries',
        data: timeSeries.map(point => point.value),
        borderColor: single.border,
        backgroundColor: single.background,
        fill: true,
        tension: 0.4
      });
    }

    return { labels, datasets };
  });

  // Bar chart data for each category
  recordTypesChartData = computed(() => this.createBarChartData(this.viewService.data()?.topRecordTypes || [], '#60A5FA'));
  recordNamesChartData = computed(() => this.createBarChartData(this.viewService.data()?.topRecordNames || [], '#A78BFA'));
  sourceIpsChartData = computed(() => this.createBarChartData(this.viewService.data()?.topSourceIps || [], '#60A5FA'));
  targetIpsChartData = computed(() => this.createBarChartData(this.viewService.data()?.topTargetIps || [], '#A78BFA'));

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public viewService: DnsViewService,
    private themeService: ThemeService,
    private chartConfig: ChartConfigService
  ) {
    // React to global theme changes via ThemeService signal
    this.themeEffectRef = effect(() => {
      // Read the signal to track changes
      void this.themeService.themeSignal()();
      this.updateChartTheme();
    });

    // Initialize chart options after dependencies are available
    this.lineChartOptions = this.chartConfig.lineOptions();
    this.barChartOptions = this.chartConfig.barOptions({ horizontal: true });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.zoneName = params['zoneName'];
      if (this.zoneName) {
        this.viewService.loadZoneData(this.zoneName);
      }
    });

    // No DOM observers needed; ThemeService signal handles theme changes
  }

  ngOnDestroy(): void {
    // Stop the theme effect
    this.themeEffectRef?.destroy();
  }

  selectChartType(type: ChartType): void {
    this.selectedChartType.set(type);
    this.chart?.update();
  }

  onRefresh(): void {
    this.viewService.refresh();
  }

  goBack(): void {
    this.router.navigate(['/dns']);
  }

  private createBarChartData(items: any[], color: string = '#60A5FA') {
    const top10 = items.slice(0, 10);
    return {
      labels: top10.map(item => item.label),
      datasets: [{
        data: top10.map(item => item.value),
        backgroundColor: color,
        borderColor: color,
        borderWidth: 0,
        borderRadius: 5
      }]
    };
  }

  private updateChartTheme(): void {
    this.lineChartOptions = this.chartConfig.lineOptions();
    this.barChartOptions = this.chartConfig.barOptions({ horizontal: true });
    // Force chart update
    setTimeout(() => {
      this.chart?.update();
    }, 50);
  }
}
