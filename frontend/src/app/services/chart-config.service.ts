import { Injectable } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { ThemeService } from './theme';

export interface ChartThemeColors {
  gridColor: string;
  textColor: string;
  borderColor: string;
}

@Injectable({ providedIn: 'root' })
export class ChartConfigService {
  constructor(private themeService: ThemeService) {}

  themeColors(): ChartThemeColors {
    const styles = getComputedStyle(document.body);
    return {
      gridColor: styles.getPropertyValue('--chart-grid-color').trim() || 'rgba(0, 0, 0, 0.1)',
      textColor: styles.getPropertyValue('--chart-text-color').trim() || '#1f2937',
      borderColor: styles.getPropertyValue('--chart-border-color').trim() || '#e5e7eb'
    };
  }

  palette(count: number): Array<{ border: string; background: string }> {
    // Slightly different emphasis for dark vs light
    const isDark = this.themeService.isDarkMode();
    const base = isDark
      ? [
          { border: 'rgb(59, 130, 246)', background: 'rgba(59, 130, 246, 0.25)' },
          { border: 'rgb(16, 185, 129)', background: 'rgba(16, 185, 129, 0.25)' },
          { border: 'rgb(245, 158, 11)', background: 'rgba(245, 158, 11, 0.25)' },
          { border: 'rgb(239, 68, 68)', background: 'rgba(239, 68, 68, 0.25)' },
          { border: 'rgb(139, 92, 246)', background: 'rgba(139, 92, 246, 0.25)' },
          { border: 'rgb(236, 72, 153)', background: 'rgba(236, 72, 153, 0.25)' }
        ]
      : [
          { border: 'rgb(59, 130, 246)', background: 'rgba(59, 130, 246, 0.10)' },
          { border: 'rgb(16, 185, 129)', background: 'rgba(16, 185, 129, 0.10)' },
          { border: 'rgb(245, 158, 11)', background: 'rgba(245, 158, 11, 0.10)' },
          { border: 'rgb(239, 68, 68)', background: 'rgba(239, 68, 68, 0.10)' },
          { border: 'rgb(139, 92, 246)', background: 'rgba(139, 92, 246, 0.10)' },
          { border: 'rgb(236, 72, 153)', background: 'rgba(236, 72, 153, 0.10)' }
        ];

    return Array.from({ length: count }, (_, i) => base[i % base.length]);
  }

  lineOptions(): ChartConfiguration['options'] {
    const colors = this.themeColors();
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: { color: colors.textColor }
        },
        tooltip: { mode: 'index', intersect: false }
      },
      scales: {
        x: {
          display: true,
          title: { display: true, text: 'Time', color: colors.textColor },
          ticks: { color: colors.textColor },
          grid: { color: colors.gridColor }
        },
        y: {
          display: true,
          title: { display: true, text: 'Queries', color: colors.textColor },
          ticks: { color: colors.textColor },
          grid: { color: colors.gridColor },
          beginAtZero: true
        }
      }
    };
  }

  barOptions({ horizontal = true }: { horizontal?: boolean } = {}): ChartConfiguration['options'] {
    const colors = this.themeColors();
    return {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: horizontal ? 'y' : 'x',
      elements: { bar: { borderWidth: 0, borderRadius: 1 } },
      plugins: {
        legend: { display: false },
        tooltip: {}
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: { color: colors.textColor },
          grid: { color: colors.gridColor }
        },
        y: {
          ticks: { color: colors.textColor },
          grid: { color: colors.gridColor }
        }
      }
    };
  }
}
