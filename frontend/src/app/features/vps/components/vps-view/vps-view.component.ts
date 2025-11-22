import { Component, OnInit, OnDestroy, ViewChildren, QueryList, inject, signal, computed, effect, EffectRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType as ChartJsType } from 'chart.js';
import { ChartConfigService } from '../../../../shared/services/chart-config.service';
import { PeriodSelectorComponent } from '../../../../shared/components/period-selector/period-selector.component';
import { ThemeService } from '../../../../shared/services/theme';
import { VpsRepository } from '../../repositories/vps.repository';
import { PeriodService, PeriodOption } from '../../../../shared/services/period.service';
import { VpsInstance, CpuChartData, MemoryChartData, DiskChartData, NetworkChartData } from '../../models/vps.models';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-vps-view',
  standalone: true,
  imports: [CommonModule, RouterModule, BaseChartDirective, PeriodSelectorComponent],
  templateUrl: './vps-view.component.html',
  styleUrl: './vps-view.component.scss'
})
export class VpsViewComponent implements OnInit, OnDestroy {
  @ViewChildren(BaseChartDirective) charts?: QueryList<BaseChartDirective>;

  private vpsRepo = inject(VpsRepository);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private themeService = inject(ThemeService);
  private chartConfig = inject(ChartConfigService);
  private periodService = inject(PeriodService);

  hostname: string | null = null;

  // State signals
  instance = signal<VpsInstance | null>(null);
  cpuData = signal<CpuChartData | null>(null);
  memoryData = signal<MemoryChartData | null>(null);
  diskData = signal<DiskChartData | null>(null);
  networkData = signal<NetworkChartData | null>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  // Chart configuration
  lineChartType: ChartJsType = 'line';
  lineChartOptions!: ChartConfiguration['options'];

  private themeEffectRef?: EffectRef;
  private periodEffectRef?: EffectRef;

  // Computed chart data
  cpuChartData = computed(() => {
    const data = this.cpuData();
    if (!data?.data) return { labels: [], datasets: [] };

    const labels = data.data.map(p => {
      const date = new Date(p.timestamp);
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    });

    const single = this.chartConfig.palette(1)[0];
    return {
      labels,
      datasets: [{
        label: 'CPU %',
        data: data.data.map(p => p.value),
        borderColor: single.border,
        backgroundColor: single.background,
        fill: true,
        tension: 0.4
      }]
    };
  });

  memoryChartData = computed(() => {
    const data = this.memoryData();
    if (!data?.data) return { labels: [], datasets: [] };

    const labels = data.data.map(p => {
      const date = new Date(p.timestamp);
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    });

    const single = this.chartConfig.palette(1)[0];
    return {
      labels,
      datasets: [{
        label: 'Memory %',
        data: data.data.map(p => p.value),
        borderColor: single.border,
        backgroundColor: single.background,
        fill: true,
        tension: 0.4
      }]
    };
  });

  networkChartData = computed(() => {
    const data = this.networkData();
    if (!data?.data) return { labels: [], datasets: [] };

    const labels = data.data.map(p => {
      const date = new Date(p.timestamp);
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    });

    const single = this.chartConfig.palette(1)[0];
    return {
      labels,
      datasets: [{
        label: 'Network',
        data: data.data.map(p => p.value),
        borderColor: single.border,
        backgroundColor: single.background,
        fill: true,
        tension: 0.4
      }]
    };
  });

  diskChartData = computed(() => {
    const data = this.diskData();
    if (!data?.data) return { labels: [], datasets: [] };

    const labels = data.data.map(p => {
      const date = new Date(p.timestamp);
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    });

    const single = this.chartConfig.palette(1)[0];
    return {
      labels,
      datasets: [{
        label: 'Disk',
        data: data.data.map(p => p.value),
        borderColor: single.border,
        backgroundColor: single.background,
        fill: true,
        tension: 0.4
      }]
    };
  });

  constructor() {
    // React to theme changes
    this.themeEffectRef = effect(() => {
      void this.themeService.themeSignal()();
      this.updateTheme();
    });

    // React to period changes
    this.periodEffectRef = effect(() => {
      const period = this.periodService.selectedPeriod();
      if (this.hostname) {
        this.loadHostData(this.hostname, period);
      }
    });

    this.lineChartOptions = this.chartConfig.lineOptions();
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.hostname = params['host'];
      if (this.hostname) {
        this.loadHostData(this.hostname);
      }
    });
  }

  ngOnDestroy(): void {
    this.themeEffectRef?.destroy();
    this.periodEffectRef?.destroy();
  }

  loadHostData(host: string, period?: PeriodOption): void {
    const selectedPeriod = period || this.periodService.getPeriod();
    this.loading.set(true);
    this.error.set(null);

    // Load all data in parallel using forkJoin
    forkJoin({
      instance: this.vpsRepo.getById(host),
      cpu: this.vpsRepo.getCpuChart(host, selectedPeriod),
      memory: this.vpsRepo.getMemoryChart(host, selectedPeriod),
      disk: this.vpsRepo.getDiskChart(host, selectedPeriod),
      network: this.vpsRepo.getNetworkChart(host, selectedPeriod)
    }).subscribe({
      next: (result) => {
        this.instance.set(result.instance);
        this.cpuData.set(result.cpu);
        this.memoryData.set(result.memory);
        this.diskData.set(result.disk);
        this.networkData.set(result.network);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load VPS data');
        this.loading.set(false);
        console.error('Error loading VPS data:', err);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/vps']);
  }

  onRefresh(): void {
    if (this.hostname) {
      this.loadHostData(this.hostname);
    }
  }

  private updateTheme(): void {
    this.lineChartOptions = this.chartConfig.lineOptions();
    setTimeout(() => this.charts?.forEach(c => c.update()), 50);
  }
}
