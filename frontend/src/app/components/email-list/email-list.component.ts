import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PeriodSelectorComponent } from '../common/period-selector/period-selector.component';
import { DataTableComponent, TableColumn } from '../common/data-table/data-table.component';
import { EmailListService, EmailDomainRow } from '../../services/email-list.service';

@Component({
  selector: 'app-email-list',
  standalone: true,
  imports: [CommonModule, PeriodSelectorComponent, DataTableComponent],
  templateUrl: './email-list.component.html',
  styleUrl: './email-list.component.scss'
})
export class EmailListComponent {
  columns: TableColumn<EmailDomainRow>[] = [
    { key: 'domain', label: 'Domain', width: '2fr', cssClass: 'cell-primary' },
    { key: 'inbound24h', label: 'Inbound (24h)', width: '1fr', render: r => r.inbound24h.toLocaleString() },
    { key: 'outbound24h', label: 'Outbound (24h)', width: '1fr', render: r => r.outbound24h.toLocaleString() },
    { key: 'bounced24h', label: 'Bounced (24h)', width: '1fr', render: r => r.bounced24h.toLocaleString() },
    { key: 'spam24h', label: 'Spam (24h)', width: '1fr', render: r => r.spam24h.toLocaleString() },
    { key: 'total24h', label: 'Total (24h)', width: '1fr', cssClass: 'cell-secondary', render: r => r.total24h.toLocaleString() },
  ];

  constructor(public service: EmailListService, private router: Router) {}

  onRefresh() { this.service.refresh(); }
  onSearchChange(q: string) { this.service.setSearchQuery(q); }
  onPageChange(p: number) { this.service.setPage(p); }
  onRowClick(row: EmailDomainRow) { this.router.navigate(['/email', row.domain]); }
}

