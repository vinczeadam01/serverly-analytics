import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface ActionButton {
  action: string;
  label: string;
  icon: string;
  cssClass: string;
}

export interface TableColumn<T = any> {
  key: string;
  label: string;
  width?: string;
  cssClass?: string;
  render?: (item: T) => string;
  actions?: ActionButton[];
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss'
})
export class DataTableComponent<T extends Record<string, any>> {
  // Inputs
  data = input.required<T[]>();
  columns = input.required<TableColumn<T>[]>();
  loading = input<boolean>(false);
  error = input<string | null>(null);
  searchPlaceholder = input<string>('Search');
  currentPage = input<number>(1);
  totalPages = input<number>(1);
  showSearch = input<boolean>(true);
  showPagination = input<boolean>(true);
  emptyMessage = input<string>('No data found');
  emptyDescription = input<string>('Try adjusting your search query');

  // Outputs
  searchChange = output<string>();
  pageChange = output<number>();
  rowClick = output<{ row: T, event: Event }>();
  actionClick = output<{ row: T, action: string, event: Event }>();

  // Local search query for two-way binding
  searchQuery = '';

  // Computed grid template
  gridTemplate = computed(() => {
    const cols = this.columns();
    return cols.map(col => col.width || '1fr').join(' ');
  });

  // Page numbers for pagination
  pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];

    // Show max 5 page numbers
    let start = Math.max(1, current - 2);
    let end = Math.min(total, start + 4);

    // Adjust start if we're near the end
    if (end - start < 4) {
      start = Math.max(1, end - 4);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  });

  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery = input.value;
    this.searchChange.emit(input.value);
  }

  onPageChange(page: number): void {
    this.pageChange.emit(page);
  }

  nextPage(): void {
    const current = this.currentPage();
    const total = this.totalPages();
    if (current < total) {
      this.onPageChange(current + 1);
    }
  }

  previousPage(): void {
    const current = this.currentPage();
    if (current > 1) {
      this.onPageChange(current - 1);
    }
  }

  getCellValue(item: T, column: TableColumn<T>): string {
    if (column.render) {
      return column.render(item);
    }
    return item[column.key]?.toString() || '';
  }

  getCellClass(column: TableColumn<T>): string {
    return column.cssClass || '';
  }

  trackByIndex(index: number): number {
    return index;
  }

  onRowClick(item: T, event: Event): void {
    this.rowClick.emit({ row: item, event });
  }

  onActionClick(item: T, action: string, event: Event): void {
    event.stopPropagation();
    this.actionClick.emit({ row: item, action, event });
  }
}
