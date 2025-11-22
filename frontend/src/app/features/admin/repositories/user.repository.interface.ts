import { Observable } from 'rxjs';
import { UserDto, CreateUserRequest, UpdateUserRequest } from '../models/user.models';

export interface IUserRepository {
  getAll(): Observable<UserDto[]>;
  create(request: CreateUserRequest): Observable<UserDto>;
  update(id: number, request: UpdateUserRequest): Observable<UserDto>;
  delete(id: number): Observable<void>;
}
