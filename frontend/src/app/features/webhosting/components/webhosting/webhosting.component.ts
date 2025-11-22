import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PeriodSelectorComponent } from '../../../../shared/components/period-selector/period-selector.component';
import { DataTableComponent, TableColumn } from '../../../../shared/components/data-table/data-table.component';
import { WebhostingRepository } from '../../repositories/webhosting.repository';
import { WebhostingAccount } from '../../models/webhosting.models';

@Component({
  selector: 'app-webhosting',
  standalone: true,
  imports: [CommonModule, PeriodSelectorComponent, DataTableComponent],
  templateUrl: './webhosting.component.html',
  styleUrl: './webhosting.component.scss'
})
export class WebhostingComponent implements OnInit {
  private webhostingRepo = inject(WebhostingRepository);
  private router = inject(Router);

  // State signals
  private accounts = signal<WebhostingAccount[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  searchQuery = signal<string>('');
  currentPage = signal<number>(1);
  private readonly pageSize = 10;

  // Computed signals for filtering and pagination
  filteredAccounts = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const allAccounts = this.accounts();
    if (!query) return allAccounts;
    return allAccounts.filter(account =>
      account.domain.toLowerCase().includes(query) ||
      account.status.toLowerCase().includes(query)
    );
  });

  paginatedAccounts = computed(() => {
    const filtered = this.filteredAccounts();
    const page = this.currentPage();
    const start = (page - 1) * this.pageSize;
    return filtered.slice(start, start + this.pageSize);
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredAccounts().length / this.pageSize)));

  columns: TableColumn<WebhostingAccount>[] = [
    { key: 'domain', label: 'Site', width: '2fr', cssClass: 'cell-primary' },
    {
      key: 'status',
      label: 'Status',
      width: '1fr',
      render: (account: WebhostingAccount) => `<span class="status-badge status-${account.status}">${account.status}</span>`
    },
    {
      key: 'totalRequests',
      label: 'Total Requests',
      width: '1.5fr',
      cssClass: 'cell-primary',
      render: (account: WebhostingAccount) => account.totalRequests.toLocaleString()
    },
    {
      key: 'bandwidth',
      label: 'Bandwidth',
      width: '1.5fr',
      cssClass: 'cell-secondary',
      render: (account: WebhostingAccount) => account.bandwidth
    }
  ];

  ngOnInit(): void {
    this.loadAccounts();
  }

  loadAccounts(): void {
    this.loading.set(true);
    this.error.set(null);
    this.webhostingRepo.getList().subscribe({
      next: (accounts) => {
        this.accounts.set(accounts);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load webhosting accounts');
        this.loading.set(false);
        console.error('Error loading webhosting accounts:', err);
      }
    });
  }

  onRefresh(): void {
    this.loadAccounts();
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

  onRowClick(account: WebhostingAccount): void {
    this.router.navigate(['/webhosting', account.domain]);
  }
}
