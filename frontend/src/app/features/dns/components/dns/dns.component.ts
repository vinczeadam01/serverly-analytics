import { Component, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PeriodSelectorComponent } from '../../../../shared/components/period-selector/period-selector.component';
import { DataTableComponent, TableColumn } from '../../../../shared/components/data-table/data-table.component';
import { DnsRepository } from '../../repositories/dns.repository';
import { DnsZone } from '../../models/dns.models';

@Component({
  selector: 'app-dns',
  standalone: true,
  imports: [CommonModule, PeriodSelectorComponent, DataTableComponent],
  templateUrl: './dns.component.html',
  styleUrl: './dns.component.scss'
})
export class DnsComponent {
  private dnsRepo = inject(DnsRepository);
  private router = inject(Router);

  // State signals
  private zones = signal<DnsZone[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  searchQuery = signal<string>('');
  currentPage = signal<number>(1);
  private readonly pageSize = 10;

  // Computed signals for filtering and pagination
  filteredZones = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const allZones = this.zones();

    if (!query) return allZones;

    return allZones.filter(zone =>
      zone.zone.toLowerCase().includes(query) ||
      zone.status.toLowerCase().includes(query)
    );
  });

  paginatedZones = computed(() => {
    const filtered = this.filteredZones();
    const page = this.currentPage();
    const start = (page - 1) * this.pageSize;
    const end = start + this.pageSize;
    return filtered.slice(start, end);
  });

  totalPages = computed(() => {
    const filtered = this.filteredZones();
    return Math.max(1, Math.ceil(filtered.length / this.pageSize));
  });

  totalZones = computed(() => {
    return this.filteredZones().length;
  });

  // Table columns configuration
  columns: TableColumn<DnsZone>[] = [
    { key: 'zone', label: 'Zone', width: '2fr', cssClass: 'cell-primary' },
    {
      key: 'status',
      label: 'Status',
      width: '1fr',
      render: (zone: DnsZone) => `<span class="status-badge status-${zone.status}">${zone.status}</span>`
    },
    {
      key: 'totalQueries',
      label: 'Total Queries',
      width: '1.5fr',
      cssClass: 'cell-primary',
      render: (zone: DnsZone) => zone.totalQueries.toLocaleString()
    },
    {
      key: 'avgResponseTime',
      label: 'Avg Response Time',
      width: '1.5fr',
      cssClass: 'cell-secondary',
      render: (zone: DnsZone) => `${zone.avgResponseTime}ms`
    }
  ];

  constructor() {
    this.loadZones();
  }

  loadZones(): void {
    this.loading.set(true);
    this.error.set(null);

    this.dnsRepo.getList().subscribe({
      next: (zones) => {
        this.zones.set(zones);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load DNS zones');
        this.loading.set(false);
      }
    });
  }

  onRefresh(): void {
    this.loadZones();
  }

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
    this.currentPage.set(1);
  }

  onPageChange(page: number): void {
    const total = this.totalPages();
    if (page >= 1 && page <= total) {
      this.currentPage.set(page);
    }
  }

  onZoneClick(zone: DnsZone): void {
    this.router.navigate(['/dns', zone.zone]);
  }
}
