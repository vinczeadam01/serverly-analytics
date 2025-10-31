import { Component, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PeriodService, PeriodOption } from '../../../services/period.service';

export interface PeriodConfig {
  value: PeriodOption;
  label: string;
}

@Component({
  selector: 'app-period-selector',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './period-selector.component.html',
  styleUrl: './period-selector.component.scss'
})
export class PeriodSelectorComponent {
  // Output event when period changes (optional, for components that need to react)
  periodChange = output<PeriodOption>();

  // Available period options
  periods: PeriodConfig[] = [
    { value: '15m', label: 'Last 15 minutes' },
    { value: '1h', label: 'Last 1 hour' },
    { value: '24h', label: 'Last 24 hours' },
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' }
  ];

  constructor(public periodService: PeriodService) {}

  onPeriodChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as PeriodOption;
    this.periodService.setPeriod(value);
    this.periodChange.emit(value);
  }
}
