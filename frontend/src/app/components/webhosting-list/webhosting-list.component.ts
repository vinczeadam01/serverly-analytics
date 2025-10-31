import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PeriodSelectorComponent } from '../common/period-selector/period-selector.component';
import { DataTableComponent, TableColumn } from '../common/data-table/data-table.component';
import { WebhostingListService, WebSite } from '../../services/webhosting-list.service';

@Component({
  selector: 'app-webhosting-list',
  standalone: true,
  imports: [CommonModule, PeriodSelectorComponent, DataTableComponent],
  templateUrl: './webhosting-list.component.html',
  styleUrl: './webhosting-list.component.scss'
})
export class WebhostingListComponent {
  columns: TableColumn<WebSite>[] = [
    { key: 'domain', label: 'Site', width: '2fr', cssClass: 'cell-primary' },
    {
      key: 'status',
      label: 'Status',
      width: '1fr',
      render: (site: WebSite) => `<span class="status-badge status-${site.status}">${site.status}</span>`
    },
    {
      key: 'requests24h',
      label: 'Requests (24h)',
      width: '1.5fr',
      cssClass: 'cell-primary',
      render: (site: WebSite) => site.requests24h.toLocaleString()
    },
    {
      key: 'bandwidth24h',
      label: 'Bandwidth (24h)',
      width: '1.5fr',
      cssClass: 'cell-secondary',
      render: (site: WebSite) => site.bandwidth24h
    },
    {
      key: 'avgResponseMs',
      label: 'Avg Response',
      width: '1fr',
      render: (site: WebSite) => `${site.avgResponseMs} ms`
    }
  ];

  constructor(
    public analyticsService: WebhostingListService,
    private router: Router,
  ) {}

  onRefresh(): void {
    this.analyticsService.refresh();
  }

  onSearchChange(query: string): void {
    this.analyticsService.setSearchQuery(query);
  }

  onPageChange(page: number): void {
    this.analyticsService.setPage(page);
  }

  onRowClick(site: WebSite): void {
    this.router.navigate(['/webhosting', site.domain]);
  }
}

