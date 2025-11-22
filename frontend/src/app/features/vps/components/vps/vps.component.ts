import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PeriodSelectorComponent } from '../../../../shared/components/period-selector/period-selector.component';
import { DataTableComponent, TableColumn } from '../../../../shared/components/data-table/data-table.component';
import { VpsRepository } from '../../repositories/vps.repository';
import { VpsInstance } from '../../models/vps.models';

@Component({
  selector: 'app-vps',
  standalone: true,
  imports: [CommonModule, PeriodSelectorComponent, DataTableComponent],
  templateUrl: './vps.component.html',
  styleUrl: './vps.component.scss'
})
export class VpsComponent implements OnInit {
  private vpsRepo = inject(VpsRepository);
  private router = inject(Router);

  // State signals
  private instances = signal<VpsInstance[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  searchQuery = signal<string>('');
  currentPage = signal<number>(1);
  private readonly pageSize = 10;

  // Computed signals for filtering and pagination
  filteredInstances = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const allInstances = this.instances();
    if (!query) return allInstances;
    return allInstances.filter(instance =>
      instance.instance.toLowerCase().includes(query) ||
      instance.status.toLowerCase().includes(query)
    );
  });

  paginatedInstances = computed(() => {
    const filtered = this.filteredInstances();
    const page = this.currentPage();
    const start = (page - 1) * this.pageSize;
    return filtered.slice(start, start + this.pageSize);
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredInstances().length / this.pageSize)));

  columns: TableColumn<VpsInstance>[] = [
    { key: 'instance', label: 'Hostname', width: '2fr', cssClass: 'cell-primary' },
    { key: 'cpuUsage', label: 'CPU %', width: '1fr', render: r => `${r.cpuUsage}%` },
    { key: 'memory', label: 'Memory', width: '1fr', render: r => r.memory },
    { key: 'diskUsage', label: 'Disk', width: '1fr', render: r => r.diskUsage },
    { key: 'network', label: 'Network', width: '1.5fr', render: r => r.network },
    { key: 'status', label: 'Status', width: '1fr', render: r => `<span class="status-badge status-${r.status}">${r.status}</span>` },
  ];

  ngOnInit(): void {
    this.loadInstances();
  }

  loadInstances(): void {
    this.loading.set(true);
    this.error.set(null);
    this.vpsRepo.getList().subscribe({
      next: (instances) => {
        this.instances.set(instances);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load VPS instances');
        this.loading.set(false);
        console.error('Error loading VPS instances:', err);
      }
    });
  }

  onRefresh(): void {
    this.loadInstances();
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

  onRowClick(instance: VpsInstance): void {
    this.router.navigate(['/vps', instance.instance]);
  }
}
