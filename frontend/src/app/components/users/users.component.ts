import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataTableComponent, TableColumn } from '../common/data-table/data-table.component';
import { UserService, UserDto } from '../../services/user.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, DataTableComponent],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent implements OnInit {
  columns: TableColumn<UserDto>[] = [
    { key: 'name', label: 'Name', width: '2fr', cssClass: 'cell-primary' },
    { key: 'email', label: 'Email', width: '2fr' },
    { key: 'role', label: 'Role', width: '1fr', render: u => `<span class="badge bg-light text-dark">${u.role}</span>` },
    { key: 'status', label: 'Status', width: '1fr', render: u => `<span class="status-badge status-${u.status}">${u.status}</span>` },
    { key: 'lastLogin', label: 'Last Login', width: '1.5fr', render: u => new Date(u.lastLogin).toLocaleString() },
    { key: 'actions', label: 'Actions', width: '1.5fr', render: () => `
        <div class=\"d-flex gap-2\">
          <button class=\"btn btn-sm btn-outline-primary\" data-action=\"edit\">Edit</button>
          <button class=\"btn btn-sm btn-outline-danger\" data-action=\"delete\">Delete</button>
        </div>
      ` },
  ];

  constructor(public users: UserService) {}

  ngOnInit(): void {
    this.users.list();
  }

  onRefresh() { this.users.list(); }
  onSearchChange(q: string) { this.users.setSearch(q); }
  onPageChange(p: number) { this.users.setPage(p); }

  onRowClick(row: UserDto, event?: Event) {
    const target = (event?.target as HTMLElement) ?? null;
    const actionBtn = target?.closest('[data-action]') as HTMLElement | null;
    const action = actionBtn?.getAttribute('data-action');
    if (action === 'delete') {
      if (confirm(`Delete ${row.email}?`)) this.users.delete(row.id);
    } else if (action === 'edit') {
      const nextRole = row.role === 'admin' ? 'user' : 'admin';
      this.users.update({ id: row.id, role: nextRole });
    }
  }

  // Add User modal state
  showAdd = false;
  roles: Array<UserDto['role']> = ['admin','user','viewer'];
  statuses: Array<UserDto['status']> = ['active','disabled','pending'];
  newUser: { name: string; email: string; role: UserDto['role']; status: UserDto['status'] } = {
    name: '', email: '', role: 'user', status: 'active'
  };

  openAdd() { this.showAdd = true; }
  closeAdd() { this.showAdd = false; this.resetNewUser(); }
  saveAdd() {
    const { name, email, role, status } = this.newUser;
    if (!name || !email) return;
    this.users.create({ name, email, role, status } as any);
    this.closeAdd();
  }
  private resetNewUser() { this.newUser = { name: '', email: '', role: 'user', status: 'active' }; }
}
