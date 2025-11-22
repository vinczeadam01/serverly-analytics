import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataTableComponent, TableColumn, ActionButton } from '../../../../shared/components/data-table/data-table.component';
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
    { key: 'status', label: 'Status', width: '1fr', render: u => `<span class="badge bg-${u.status === 'active' ? 'success' : u.status === 'disabled' ? 'danger' : 'warning'}">${u.status}</span>` },
    { key: 'lastLogin', label: 'Last Login', width: '1.5fr', render: u => u.lastLogin ? new Date(u.lastLogin).toLocaleString() : 'Never' },
    {
      key: 'actions',
      label: 'Actions',
      width: '1.5fr',
      actions: [
        { action: 'edit', label: 'Edit', icon: 'bi bi-pencil', cssClass: 'btn btn-sm btn-outline-primary' },
        { action: 'delete', label: 'Delete', icon: 'bi bi-trash', cssClass: 'btn btn-sm btn-outline-danger' }
      ]
    },
  ];

  constructor(public users: UserService) {}

  ngOnInit(): void {
    this.users.list();
  }

  onRefresh() { this.users.list(); }
  onSearchChange(q: string) { this.users.setSearch(q); }
  onPageChange(p: number) { this.users.setPage(p); }

  onAction(event: { row: UserDto, action: string, event: Event }) {
    if (event.action === 'edit') {
      this.openEdit(event.row);
    } else if (event.action === 'delete') {
      this.openDelete(event.row);
    }
  }

  showAdd = false;
  showEdit = false;
  showDelete = false;
  roles: Array<UserDto['role']> = ['admin','user'];
  statuses: Array<UserDto['status']> = ['active','disabled','pending'];

  newUser: { name: string; email: string; role: UserDto['role']; status: UserDto['status'] } = {
    name: '', email: '', role: 'user', status: 'active'
  };

  editUser: { id: number; name: string; email: string; role: UserDto['role']; status: UserDto['status'] } = {
    id: 0, name: '', email: '', role: 'user', status: 'active'
  };

  deleteUser: UserDto | null = null;

  openAdd() { this.showAdd = true; }
  closeAdd() { this.showAdd = false; this.resetNewUser(); }
  saveAdd() {
    const { name, email, role, status } = this.newUser;
    if (!name || !email) return;
    this.users.create({ name, email, role, status } as any);
    this.closeAdd();
  }

  openEdit(user: UserDto) {
    this.editUser = { id: user.id, name: user.name, email: user.email, role: user.role, status: user.status };
    this.showEdit = true;
  }
  closeEdit() { this.showEdit = false; }
  saveEdit() {
    const { id, name, email, role, status } = this.editUser;
    if (!name || !email) return;
    this.users.update({ id, name, email, role, status });
    this.closeEdit();
  }

  openDelete(user: UserDto) {
    this.deleteUser = user;
    this.showDelete = true;
  }
  closeDelete() { this.showDelete = false; this.deleteUser = null; }
  confirmDelete() {
    if (this.deleteUser) {
      this.users.delete(this.deleteUser.id);
      this.closeDelete();
    }
  }

  private resetNewUser() { this.newUser = { name: '', email: '', role: 'user', status: 'active' }; }
}
