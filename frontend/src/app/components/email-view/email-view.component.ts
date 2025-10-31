import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PeriodSelectorComponent } from '../common/period-selector/period-selector.component';
import { EmailViewService } from '../../services/email-view.service';

@Component({
  selector: 'app-email-view',
  standalone: true,
  imports: [CommonModule, RouterModule, PeriodSelectorComponent],
  templateUrl: './email-view.component.html',
  styleUrl: './email-view.component.scss'
})
export class EmailViewComponent implements OnInit, OnDestroy {
  domain: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public view: EmailViewService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(p => {
      this.domain = p['domain'];
      if (this.domain) this.view.load(this.domain);
    });
  }

  ngOnDestroy(): void {}

  onRefresh() { this.view.refresh(); }
  goBack() { this.router.navigate(['/email']); }
}

