import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IUserRepository } from './user.repository.interface';
import { UserDto, CreateUserRequest, UpdateUserRequest } from '../models/user.models';

@Injectable({ providedIn: 'root' })
export class UserRepository implements IUserRepository {
  constructor(private http: HttpClient) {}

  getAll(): Observable<UserDto[]> {
    return this.http.get<UserDto[]>(`${environment.apiUrl}/admin/users`);
  }

  create(request: CreateUserRequest): Observable<UserDto> {
    return this.http.post<UserDto>(`${environment.apiUrl}/admin/users`, request);
  }

  update(id: number, request: UpdateUserRequest): Observable<UserDto> {
    return this.http.put<UserDto>(`${environment.apiUrl}/admin/users/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/admin/users/${id}`);
  }
}
