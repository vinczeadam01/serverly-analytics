import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/components/login/login.component';
import { RegisterComponent } from './features/register/components/register/register.component';
import { DashboardComponent } from './features/dashboard/components/dashboard/dashboard.component';
import { DnsComponent } from './features/dns/components/dns/dns.component';
import { DnsViewComponent } from './features/dns/components/dns-view/dns-view.component';
import { WebhostingComponent } from './features/webhosting/components/webhosting/webhosting.component';
import { WebhostingViewComponent } from './features/webhosting/components/webhosting-view/webhosting-view.component';
import { EmailComponent } from './features/email/components/email/email.component';
import { EmailViewComponent } from './features/email/components/email-view/email-view.component';
import { VpsComponent } from './features/vps/components/vps/vps.component';
import { VpsViewComponent } from './features/vps/components/vps-view/vps-view.component';
import { ProfileComponent } from './features/admin/components/profile/profile.component';
import { UsersComponent } from './features/admin/components/users/users.component';
import { KafkaComponent } from './features/kafka/components/kafka/kafka.component';
import { LayoutComponent } from './core/layout/components/layout/layout.component';
import { authGuard } from './core/auth/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'dns', component: DnsComponent },
      { path: 'dns/:zoneName', component: DnsViewComponent },
      { path: 'webhosting', component: WebhostingComponent },
      { path: 'webhosting/:site', component: WebhostingViewComponent },
      { path: 'email', component: EmailComponent },
      { path: 'email/:domain', component: EmailViewComponent },
      { path: 'vps', component: VpsComponent },
      { path: 'vps/:host', component: VpsViewComponent },
      { path: 'kafka', component: KafkaComponent },
      { path: 'settings', component: ProfileComponent },
      { path: 'users', component: UsersComponent },
    ]
  },
  { path: '**', redirectTo: '/dashboard' }
];
