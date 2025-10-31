import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

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
      error: () => {
        // demo: create locally
        const id = Math.max(0, ...this._users().map(u => u.id)) + 1;
        const now = new Date().toISOString();
        const created: UserDto = { id, lastLogin: now, ...user } as UserDto;
        this._users.set([created, ...this._users()]);
      }
    });
  }

  list(): void {
    this._loading.set(true);
    this._error.set(null);
    const url = `${environment.apiUrl}/admin/users`;
    this.http.get<UserDto[]>(url).subscribe({
      next: (users) => { this._users.set(users); this._loading.set(false); },
      error: () => {
        // demo fallback with slight delay
        setTimeout(() => {
          this._users.set(this.generateDemoUsers());
          this._loading.set(false);
          this._error.set(null);
        }, 800);
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
      error: () => {
        // optimistic fallback: update local for demo
        const current = this._users();
        const next = current.map(u => u.id === user.id ? { ...u, ...user } as UserDto : u);
        this._users.set(next);
      }
    });
  }

  delete(id: number): void {
    const url = `${environment.apiUrl}/admin/users/${id}`;
    this.http.delete<void>(url).subscribe({
      next: () => {
        this._users.set(this._users().filter(u => u.id !== id));
      },
      error: () => {
        // demo: remove locally
        this._users.set(this._users().filter(u => u.id !== id));
      }
    });
  }

  setSearch(q: string) { this._search.set(q); this._page.set(1); }
  setPage(p: number) { const t = this.totalPages(); if (p>=1 && p<=t) this._page.set(p); }

  private generateDemoUsers(): UserDto[] {
    const roles: UserRole[] = ['admin','user','viewer'];
    const statuses: UserStatus[] = ['active','disabled','pending'];
    return Array.from({ length: 42 }).map((_, i) => {
      const name = `User ${i+1}`;
      const email = `user${i+1}@serverly.com`;
      const role = roles[Math.floor(Math.random()*roles.length)];
      const status = statuses[Math.floor(Math.random()*statuses.length)];
      const last = new Date(Date.now() - Math.random()*14*24*60*60*1000);
      return {
        id: i+1,
        name,
        email,
        role,
        status,
        lastLogin: last.toISOString(),
      };
    });
  }
}
