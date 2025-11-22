import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

export type UserRole = 'admin' | 'user' | 'viewer';
export type UserStatus = 'active' | 'disabled' | 'pending';

export interface UserDto {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastLogin: string; // ISO date
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private _users = signal<UserDto[]>([]);
  private _loading = signal<boolean>(false);
  private _error = signal<string | null>(null);

  private _search = signal<string>('');
  private _page = signal<number>(1);
  private readonly _pageSize = 10;

  readonly users = this._users.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly search = this._search.asReadonly();
  readonly page = this._page.asReadonly();

  readonly filteredUsers = computed(() => {
    const q = this._search().toLowerCase();
    const all = this._users();
    if (!q) return all;
    return all.filter(u =>
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q) ||
      u.status.toLowerCase().includes(q)
    );
  });

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.filteredUsers().length / this._pageSize)));
  readonly paginatedUsers = computed(() => {
    const start = (this._page() - 1) * this._pageSize;
    return this.filteredUsers().slice(start, start + this._pageSize);
  });

  constructor(private http: HttpClient) {}

  create(user: Omit<UserDto, 'id' | 'lastLogin'>): void {
    const url = `${environment.apiUrl}/admin/users`;
    this.http.post<UserDto>(url, user).subscribe({
      next: (created) => {
        this._users.set([created, ...this._users()]);
      },
      error: (err) => {
        console.error('Failed to create user:', err);
        this._error.set('Failed to create user');
      }
    });
  }

  list(): void {
    this._loading.set(true);
    this._error.set(null);
    const url = `${environment.apiUrl}/admin/users`;
    this.http.get<UserDto[]>(url).subscribe({
      next: (users) => {
        this._users.set(users);
        this._loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load users:', err);
        this._error.set('Failed to load users');
        this._loading.set(false);
      }
    });
  }

  update(user: Partial<UserDto> & { id: number }): void {
    const url = `${environment.apiUrl}/admin/users/${user.id}`;
    this.http.put<UserDto>(url, user).subscribe({
      next: (updated) => {
        const current = this._users();
        const next = current.map(u => u.id === updated.id ? { ...u, ...updated } : u);
        this._users.set(next);
      },
      error: (err) => {
        console.error('Failed to update user:', err);
        this._error.set('Failed to update user');
      }
    });
  }

  delete(id: number): void {
    const url = `${environment.apiUrl}/admin/users/${id}`;
    this.http.delete<void>(url).subscribe({
      next: () => {
        this._users.set(this._users().filter(u => u.id !== id));
      },
      error: (err) => {
        console.error('Failed to delete user:', err);
        this._error.set('Failed to delete user');
      }
    });
  }

  setSearch(q: string) { this._search.set(q); this._page.set(1); }
  setPage(p: number) { const t = this.totalPages(); if (p>=1 && p<=t) this._page.set(p); }
}
