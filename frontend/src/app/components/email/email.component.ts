import { Component } from '@angular/core';
import { PeriodSelectorComponent } from '../common/period-selector/period-selector.component';
import { EmailAnalyticsService } from '../../services/email-analytics.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-email',
  standalone: true,
  imports: [CommonModule, PeriodSelectorComponent],
  templateUrl: './email.component.html',
  styleUrl: './email.component.scss'
})
export class EmailComponent {
  constructor(public analyticsService: EmailAnalyticsService) {}

  onRefresh(): void {
    this.analyticsService.refresh();
  }
}
