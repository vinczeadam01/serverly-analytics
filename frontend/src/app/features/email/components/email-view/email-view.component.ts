import { Component, OnInit, OnDestroy, inject, signal, EffectRef, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PeriodSelectorComponent } from '../../../../shared/components/period-selector/period-selector.component';
import { EmailRepository } from '../../repositories/email.repository';
import { PeriodService, PeriodOption } from '../../../../shared/services/period.service';
import { EmailAccount, FlowChartData, TopRecipient, TopSender, ServerMetrics } from '../../models/email.models';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-email-view',
  standalone: true,
  imports: [CommonModule, RouterModule, PeriodSelectorComponent],
  templateUrl: './email-view.component.html',
  styleUrl: './email-view.component.scss'
})
export class EmailViewComponent implements OnInit, OnDestroy {
  private emailRepo = inject(EmailRepository);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private periodService = inject(PeriodService);

  domain: string | null = null;

  // State signals
  account = signal<EmailAccount | null>(null);
  flowChartData = signal<FlowChartData | null>(null);
  topRecipients = signal<TopRecipient[]>([]);
  topSenders = signal<TopSender[]>([]);
  servers = signal<ServerMetrics[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  private periodEffectRef?: EffectRef;

  constructor() {
    // React to period changes
    this.periodEffectRef = effect(() => {
      const period = this.periodService.selectedPeriod();
      if (this.domain) {
        this.loadAccountData(this.domain, period);
      }
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.domain = params['domain'];
      if (this.domain) {
        this.loadAccountData(this.domain);
      }
    });
  }

  ngOnDestroy(): void {
    this.periodEffectRef?.destroy();
  }

  loadAccountData(domain: string, period?: PeriodOption): void {
    const selectedPeriod = period || this.periodService.getPeriod();
    this.loading.set(true);
    this.error.set(null);

    // Load all data in parallel using forkJoin
    forkJoin({
      account: this.emailRepo.getById(domain),
      flowChart: this.emailRepo.getFlowChart(domain, selectedPeriod),
      topRecipients: this.emailRepo.getTopRecipients(domain, selectedPeriod),
      topSenders: this.emailRepo.getTopSenders(domain, selectedPeriod),
      servers: this.emailRepo.getServers(domain, selectedPeriod)
    }).subscribe({
      next: (result) => {
        this.account.set(result.account);
        this.flowChartData.set(result.flowChart);
        this.topRecipients.set(result.topRecipients);
        this.topSenders.set(result.topSenders);
        this.servers.set(result.servers);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load email account data');
        this.loading.set(false);
        console.error('Error loading email account data:', err);
      }
    });
  }

  onRefresh(): void {
    if (this.domain) {
      this.loadAccountData(this.domain);
    }
  }

  goBack(): void {
    this.router.navigate(['/email']);
  }
}
