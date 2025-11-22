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

export interface CreateUserRequest {
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
}

export interface UpdateUserRequest {
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
}
