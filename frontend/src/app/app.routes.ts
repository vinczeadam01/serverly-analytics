import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { DnsComponent } from './components/dns/dns.component';
import { DnsViewComponent } from './components/dns-view/dns-view.component';
import { WebhostingListComponent } from './components/webhosting-list/webhosting-list.component';
import { WebhostingViewComponent } from './components/webhosting-view/webhosting-view.component';
import { EmailListComponent } from './components/email-list/email-list.component';
import { EmailViewComponent } from './components/email-view/email-view.component';
import { VpsListComponent } from './components/vps-list/vps-list.component';
import { VpsViewComponent } from './components/vps-view/vps-view.component';
import { ProfileComponent } from './components/profile/profile.component';
import { UsersComponent } from './components/users/users.component';
import { KafkaComponent } from './components/kafka/kafka.component';
import { LayoutComponent } from './components/layout/layout.component';
import { authGuard } from './guards/auth.guard';

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
      { path: 'webhosting', component: WebhostingListComponent },
      { path: 'webhosting/:site', component: WebhostingViewComponent },
      { path: 'email', component: EmailListComponent },
      { path: 'email/:domain', component: EmailViewComponent },
      { path: 'vps', component: VpsListComponent },
      { path: 'vps/:host', component: VpsViewComponent },
      { path: 'kafka', component: KafkaComponent },
      { path: 'settings', component: ProfileComponent },
      { path: 'users', component: UsersComponent },
    ]
  },
  { path: '**', redirectTo: '/dashboard' }
];
