import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfileService } from '../../services/profile.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  loading = false;
  error: string | null = null;
  successMessage: string | null = null;

  profile = {
    id: 0,
    name: '',
    email: '',
    role: ''
  };

  editMode = false;
  editProfile = {
    name: '',
    email: ''
  };

  showPasswordChange = false;
  passwordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  constructor(private profileService: ProfileService) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading = true;
    this.error = null;
    this.profileService.getProfile().subscribe({
      next: (data) => {
        this.profile = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load profile';
        this.loading = false;
      }
    });
  }

  enableEdit(): void {
    this.editProfile = {
      name: this.profile.name,
      email: this.profile.email
    };
    this.editMode = true;
  }

  cancelEdit(): void {
    this.editMode = false;
    this.error = null;
  }

  saveProfile(): void {
    this.loading = true;
    this.error = null;
    this.profileService.updateProfile(this.editProfile).subscribe({
      next: (data) => {
        this.profile = data;
        this.editMode = false;
        this.loading = false;
        this.showSuccess('Profile updated successfully');
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to update profile';
        this.loading = false;
      }
    });
  }

  openPasswordChange(): void {
    this.showPasswordChange = true;
    this.passwordData = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
    this.error = null;
  }

  closePasswordChange(): void {
    this.showPasswordChange = false;
    this.passwordData = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
    this.error = null;
  }

  changePassword(): void {
    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }

    if (this.passwordData.newPassword.length < 6) {
      this.error = 'Password must be at least 6 characters';
      return;
    }

    this.loading = true;
    this.error = null;
    this.profileService.changePassword({
      currentPassword: this.passwordData.currentPassword,
      newPassword: this.passwordData.newPassword
    }).subscribe({
      next: () => {
        this.loading = false;
        this.closePasswordChange();
        this.showSuccess('Password changed successfully');
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to change password';
        this.loading = false;
      }
    });
  }

  private showSuccess(message: string): void {
    this.successMessage = message;
    setTimeout(() => this.successMessage = null, 3000);
  }
}
