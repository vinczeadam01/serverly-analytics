import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PeriodSelectorComponent } from '../common/period-selector/period-selector.component';
import { DataTableComponent, TableColumn } from '../common/data-table/data-table.component';
import { DnsListService, DnsZone } from '../../services/dns-list.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dns',
  standalone: true,
  imports: [CommonModule, PeriodSelectorComponent, DataTableComponent],
  templateUrl: './dns.component.html',
  styleUrl: './dns.component.scss'
})
export class DnsComponent {
  columns: TableColumn<DnsZone>[] = [
    { key: 'zone', label: 'Zone', width: '2fr', cssClass: 'cell-primary' },
    {
      key: 'type',
      label: 'Type',
      width: '1fr',
      render: (zone: DnsZone) => `<span class="badge bg-light text-dark">${zone.type}</span>`
    },
    { key: 'records', label: 'Records', width: '1fr' },
    { key: 'lastUpdate', label: 'Last Update', width: '1.5fr', cssClass: 'cell-secondary' },
    {
      key: 'queries24h',
      label: 'Queries (24h)',
      width: '1.5fr',
      cssClass: 'cell-primary',
      render: (zone: DnsZone) => zone.queries24h.toLocaleString()
    },
    {
      key: 'status',
      label: 'Status',
      width: '1fr',
      render: (zone: DnsZone) => `<span class="status-badge status-${zone.status}">${zone.status}</span>`
    }
  ];

  constructor(
    public analyticsService: DnsListService,
    private router: Router
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

  onZoneClick(zone: DnsZone): void {
    this.router.navigate(['/dns', zone.zone]);
  }
}
