import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PeriodSelectorComponent } from '../../../../shared/components/period-selector/period-selector.component';
import { DataTableComponent, TableColumn } from '../../../../shared/components/data-table/data-table.component';
import { EmailRepository } from '../../repositories/email.repository';
import { EmailAccount } from '../../models/email.models';

@Component({
  selector: 'app-email',
  standalone: true,
  imports: [CommonModule, PeriodSelectorComponent, DataTableComponent],
  templateUrl: './email.component.html',
  styleUrl: './email.component.scss'
})
export class EmailComponent implements OnInit {
  private emailRepo = inject(EmailRepository);
  private router = inject(Router);

  // State signals
  private accounts = signal<EmailAccount[]>([]);
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

  columns: TableColumn<EmailAccount>[] = [
    { key: 'domain', label: 'Domain', width: '2fr', cssClass: 'cell-primary' },
    { key: 'totalEmails', label: 'Total Emails', width: '1fr', render: r => r.totalEmails.toLocaleString() },
    { key: 'deliveryRate', label: 'Delivery Rate', width: '1fr', render: r => `${r.deliveryRate.toFixed(1)}%` },
    {
      key: 'status',
      label: 'Status',
      width: '1fr',
      cssClass: 'cell-secondary',
      render: r => r.status
    },
  ];

  ngOnInit(): void {
    this.loadAccounts();
  }

  loadAccounts(): void {
    this.loading.set(true);
    this.error.set(null);
    this.emailRepo.getList().subscribe({
      next: (accounts) => {
        this.accounts.set(accounts);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load email accounts');
        this.loading.set(false);
        console.error('Error loading email accounts:', err);
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

  onRowClick(account: EmailAccount): void {
    this.router.navigate(['/email', account.domain]);
  }
}
