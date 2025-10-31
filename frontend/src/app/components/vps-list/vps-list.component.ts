import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PeriodSelectorComponent } from '../common/period-selector/period-selector.component';
import { DataTableComponent, TableColumn } from '../common/data-table/data-table.component';
import { VpsListService, VpsHostRow } from '../../services/vps-list.service';

@Component({
  selector: 'app-vps-list',
  standalone: true,
  imports: [CommonModule, PeriodSelectorComponent, DataTableComponent],
  templateUrl: './vps-list.component.html',
  styleUrl: './vps-list.component.scss'
})
export class VpsListComponent {
  columns: TableColumn<VpsHostRow>[] = [
    { key: 'hostname', label: 'Hostname', width: '2fr', cssClass: 'cell-primary' },
    { key: 'cpu', label: 'CPU %', width: '1fr', render: r => `${r.cpu}%` },
    { key: 'memory', label: 'Memory %', width: '1fr', render: r => `${r.memory}%` },
    { key: 'disk', label: 'Disk %', width: '1fr', render: r => `${r.disk}%` },
    { key: 'net', label: 'Network', width: '1.5fr', render: r => `${r.netInMbps} / ${r.netOutMbps} Mbps` },
    { key: 'status', label: 'Status', width: '1fr', render: r => `<span class="status-badge status-${r.status}">${r.status}</span>` },
  ];

  constructor(public service: VpsListService, private router: Router) {}

  onRefresh() { this.service.refresh(); }
  onSearchChange(q: string) { this.service.setSearch(q); }
  onPageChange(p: number) { this.service.setPage(p); }
  onRowClick(row: VpsHostRow) { this.router.navigate(['/vps', row.hostname]); }
}

