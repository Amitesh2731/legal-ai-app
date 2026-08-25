import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonRefresher, IonRefresherContent, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  logOutOutline, createOutline, mailOutline, callOutline, 
  locationOutline, cameraOutline, closeOutline, checkmarkOutline,
  personOutline
} from 'ionicons/icons';
import { AuthService } from '../../../core/services/auth.service';
import { ProfileService } from '../../../core/services/profile.service';
import { ToastService } from '../../../core/services/toast.service';
import { User } from '../../../core/models/user.model';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state.component';

@Component({
  selector: 'app-client-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonRefresher, IonRefresherContent, IonIcon, IonSpinner, ErrorStateComponent],
  template: `
    <ion-content [fullscreen]="true">
      <ion-refresher slot="fixed" (ionRefresh)="loadProfile($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <div class="profile-wrapper">
        @if (error) {
          <app-error-state 
            title="Unable to load profile" 
            [description]="error" 
            (retry)="loadProfile()">
          </app-error-state>
        } @else {
          <!-- Header section -->
          <div class="profile-header animate-fade-in-up">
            <div class="avatar-container" (click)="isEditing ? changeProfilePhoto() : null" [class.editable]="isEditing">
              @if (photoLoading) {
                <div class="avatar-loading">
                  <ion-spinner name="crescent"></ion-spinner>
                </div>
              } @else if (user?.profile_photo) {
                <img [src]="user?.profile_photo" alt="Profile" class="avatar-img" />
              } @else {
                <div class="avatar-placeholder">
                  <span>{{ getInitials() }}</span>
                </div>
              }
              
              @if (isEditing) {
                <div class="avatar-overlay">
                  <ion-icon name="camera-outline"></ion-icon>
                </div>
              }
            </div>

            <div class="header-info">
              <h1 class="user-name">{{ user?.first_name }} {{ user?.last_name }}</h1>
              <span class="user-role">Client Account</span>
            </div>

            @if (!isEditing) {
              <button class="btn-edit" (click)="toggleEdit()">
                <ion-icon name="create-outline"></ion-icon>
                <span>Edit Profile</span>
              </button>
            }
          </div>

          <!-- Content section -->
          <div class="profile-content animate-fade-in-up animate-delay-1">
            
            <div class="section-card">
              <div class="section-title">Personal Information</div>

              @if (!isEditing) {
                <!-- View Mode -->
                <div class="info-list">
                  <div class="info-item">
                    <div class="info-icon"><ion-icon name="person-outline"></ion-icon></div>
                    <div class="info-details">
                      <span class="label">Full Name</span>
                      <span class="value">{{ user?.first_name }} {{ user?.last_name }}</span>
                    </div>
                  </div>
                  
                  <div class="info-item">
                    <div class="info-icon"><ion-icon name="mail-outline"></ion-icon></div>
                    <div class="info-details">
                      <span class="label">Email Address</span>
                      <span class="value">{{ user?.email }}</span>
                    </div>
                  </div>
                  
                  <div class="info-item">
                    <div class="info-icon"><ion-icon name="call-outline"></ion-icon></div>
                    <div class="info-details">
                      <span class="label">Phone Number</span>
                      <span class="value">{{ user?.phone || 'Not provided' }}</span>
                    </div>
                  </div>
                  
                  <div class="info-item">
                    <div class="info-icon"><ion-icon name="location-outline"></ion-icon></div>
                    <div class="info-details">
                      <span class="label">Location</span>
                      <span class="value">
                        {{ user?.city ? user?.city + (user?.state ? ', ' + user?.state : '') : 'Not provided' }}
                      </span>
                    </div>
                  </div>
                </div>
              } @else {
                <!-- Edit Mode Form -->
                <div class="edit-form">
                  <div class="form-row">
                    <div class="form-group">
                      <label>First Name</label>
                      <input type="text" [(ngModel)]="editForm.first_name" class="custom-input" />
                    </div>
                    <div class="form-group">
                      <label>Last Name</label>
                      <input type="text" [(ngModel)]="editForm.last_name" class="custom-input" />
                    </div>
                  </div>
                  
                  <div class="form-group">
                    <label>Email Address</label>
                    <input type="email" [value]="user?.email" class="custom-input" disabled />
                    <span class="help-text">Email address cannot be changed</span>
                  </div>
                  
                  <div class="form-group">
                    <label>Phone Number</label>
                    <input type="tel" [(ngModel)]="editForm.phone" class="custom-input" placeholder="e.g. +91 98765 43210" />
                  </div>
                  
                  <div class="form-row">
                    <div class="form-group">
                      <label>City</label>
                      <input type="text" [(ngModel)]="editForm.city" class="custom-input" placeholder="City" />
                    </div>
                    <div class="form-group">
                      <label>State</label>
                      <input type="text" [(ngModel)]="editForm.state" class="custom-input" placeholder="State" />
                    </div>
                  </div>
                </div>
              }
            </div>
            
            @if (isEditing) {
              <div class="form-actions animate-fade-in-up">
                <button class="btn-cancel" (click)="toggleEdit()" [disabled]="saving">
                  Cancel
                </button>
                <button class="btn-save" (click)="saveProfile()" [disabled]="saving">
                  @if (saving) {
                    <ion-spinner name="crescent"></ion-spinner> Saving...
                  } @else {
                    <ion-icon name="checkmark-outline"></ion-icon> Save Changes
                  }
                </button>
              </div>
            } @else {
              <div class="danger-zone animate-fade-in-up animate-delay-2">
                <button class="btn-logout" (click)="logout()">
                  <ion-icon name="log-out-outline"></ion-icon>
                  Sign Out
                </button>
              </div>
            }
            
          </div>
        }
      </div>
    </ion-content>
  `,
  styles: [`
    .profile-wrapper {
      padding: var(--spacing-6) var(--spacing-5) var(--spacing-12);
      max-width: 600px;
      margin: 0 auto;
    }

    /* Header */
    .profile-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: var(--spacing-8);
      text-align: center;
    }

    .avatar-container {
      position: relative;
      width: 96px;
      height: 96px;
      border-radius: 50%;
      margin-bottom: var(--spacing-4);
      background: var(--app-surface-secondary);
      box-shadow: var(--shadow-md);
      overflow: hidden;
      
      &.editable {
        cursor: pointer;
        
        &:hover .avatar-overlay {
          opacity: 1;
        }
      }
    }

    .avatar-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .avatar-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--app-primary);
      color: var(--app-surface);
      font-size: 32px;
      font-weight: 600;
      letter-spacing: 1px;
    }

    .avatar-loading {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--app-surface-secondary);
    }

    .avatar-overlay {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      opacity: 0;
      transition: opacity 0.2s ease;
      
      ion-icon {
        font-size: 28px;
      }
    }

    .header-info {
      margin-bottom: var(--spacing-4);
    }

    .user-name {
      font-size: var(--text-page-title);
      font-weight: 700;
      color: var(--app-text-primary);
      margin: 0 0 4px;
      letter-spacing: -0.5px;
    }

    .user-role {
      font-size: var(--text-body);
      color: var(--app-text-secondary);
      font-weight: 500;
    }

    .btn-edit {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: var(--app-surface);
      border: 1px solid var(--app-border);
      border-radius: var(--radius-pill);
      font-size: var(--text-body);
      font-weight: 600;
      color: var(--app-text-primary);
      box-shadow: var(--shadow-sm);
      cursor: pointer;
      transition: all 0.2s ease;
      
      &:active {
        background: var(--app-surface-secondary);
      }
    }

    /* Content Cards */
    .section-card {
      background: var(--app-surface);
      border: 1px solid var(--app-border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      padding: var(--spacing-5);
      margin-bottom: var(--spacing-6);
    }

    .section-title {
      font-size: var(--text-card-title);
      font-weight: 700;
      color: var(--app-text-primary);
      margin-bottom: var(--spacing-5);
      padding-bottom: var(--spacing-3);
      border-bottom: 1px solid var(--app-border);
    }

    /* View Mode */
    .info-list {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-4);
    }

    .info-item {
      display: flex;
      align-items: flex-start;
      gap: var(--spacing-3);
    }

    .info-icon {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-md);
      background: var(--app-surface-secondary);
      color: var(--app-text-secondary);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      
      ion-icon {
        font-size: 18px;
      }
    }

    .info-details {
      display: flex;
      flex-direction: column;
      padding-top: 2px;
    }

    .label {
      font-size: var(--text-caption);
      color: var(--app-text-secondary);
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 2px;
    }

    .value {
      font-size: var(--text-body);
      color: var(--app-text-primary);
      font-weight: 500;
    }

    /* Edit Form */
    .edit-form {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-4);
    }

    .form-row {
      display: flex;
      gap: var(--spacing-3);
      
      .form-group { flex: 1; }
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
      
      label {
        font-size: var(--text-caption);
        font-weight: 600;
        color: var(--app-text-secondary);
      }
    }

    .custom-input {
      width: 100%;
      height: 44px;
      padding: 0 12px;
      border: 1px solid var(--app-border);
      border-radius: var(--radius-md);
      font-size: var(--text-body);
      color: var(--app-text-primary);
      background: var(--app-surface);
      transition: all 0.2s ease;
      
      &:focus {
        outline: none;
        border-color: var(--app-primary);
        box-shadow: 0 0 0 2px rgba(17, 24, 39, 0.1);
      }
      
      &:disabled {
        background: var(--app-surface-secondary);
        color: var(--app-text-muted);
      }
    }
    
    .help-text {
      font-size: var(--text-caption);
      color: var(--app-text-muted);
    }

    /* Actions */
    .form-actions {
      display: flex;
      gap: var(--spacing-3);
    }
    
    .btn-cancel, .btn-save {
      flex: 1;
      height: 44px;
      border-radius: var(--radius-md);
      font-size: var(--text-body);
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      
      &:disabled {
        opacity: 0.7;
        pointer-events: none;
      }
    }
    
    .btn-cancel {
      background: var(--app-surface);
      border: 1px solid var(--app-border);
      color: var(--app-text-primary);
      
      &:active { background: var(--app-surface-secondary); }
    }
    
    .btn-save {
      background: var(--app-primary);
      border: none;
      color: var(--app-surface);
      
      &:active { background: var(--app-primary-light); }
      
      ion-spinner { width: 16px; height: 16px; }
    }

    .danger-zone {
      margin-top: var(--spacing-6);
    }

    .btn-logout {
      width: 100%;
      height: 44px;
      border-radius: var(--radius-md);
      background: var(--app-surface);
      border: 1px solid #fca5a5;
      color: #dc2626;
      font-size: var(--text-body);
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      
      &:active {
        background: #fef2f2;
      }
      
      ion-icon { font-size: 20px; }
    }
  `]
})
export class ClientProfilePage implements OnInit {
  user: User | null = null;
  isEditing = false;
  saving = false;
  photoLoading = false;
  error = '';
  
  editForm = {
    first_name: '',
    last_name: '',
    phone: '',
    city: '',
    state: ''
  };

  constructor(
    private authService: AuthService,
    private profileService: ProfileService,
    private toastService: ToastService
  ) {
    addIcons({ logOutOutline, createOutline, mailOutline, callOutline, locationOutline, cameraOutline, closeOutline, checkmarkOutline, personOutline });
  }

  ngOnInit() {
    this.user = this.authService.currentUser;
    if (!this.user) {
      this.loadProfile();
    }
  }

  getInitials(): string {
    if (!this.user) return 'C';
    return `${this.user.first_name?.charAt(0) || ''}${this.user.last_name?.charAt(0) || ''}`.toUpperCase() || 'C';
  }

  loadProfile(event?: any) {
    this.error = '';
    this.profileService.getClientProfile().subscribe({
      next: (user) => {
        this.user = user;
        if (event) event.target.complete();
      },
      error: (err) => {
        this.error = 'Failed to load profile. Please try again.';
        if (event) event.target.complete();
      }
    });
  }

  toggleEdit() {
    if (this.isEditing) {
      this.isEditing = false;
    } else {
      if (this.user) {
        this.editForm = {
          first_name: this.user.first_name || '',
          last_name: this.user.last_name || '',
          phone: this.user.phone || '',
          city: this.user.city || '',
          state: this.user.state || ''
        };
      }
      this.isEditing = true;
    }
  }

  saveProfile() {
    if (!this.editForm.first_name.trim() || !this.editForm.last_name.trim()) {
      this.toastService.showError('First and last name are required');
      return;
    }

    this.saving = true;
    this.profileService.updateClientProfile(this.editForm).subscribe({
      next: (updatedUser) => {
        this.user = updatedUser;
        // Optionally update AuthService state if it stores user globally
        // this.authService.updateCurrentUser(updatedUser);
        this.isEditing = false;
        this.saving = false;
        this.toastService.showSuccess('Profile updated successfully');
      },
      error: (err) => {
        this.toastService.showError('Failed to update profile');
        this.saving = false;
      }
    });
  }

  async changeProfilePhoto() {
    if (this.photoLoading) return;
    
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Uri,
        source: CameraSource.Prompt // Let user choose camera or gallery
      });

      if (image.webPath) {
        this.photoLoading = true;
        
        // Fetch the file blob from the URI
        const response = await fetch(image.webPath);
        const blob = await response.blob();
        
        // Create a File object
        const fileName = `profile_${new Date().getTime()}.${image.format || 'jpg'}`;
        const file = new File([blob], fileName, { type: blob.type });
        
        // Upload
        this.profileService.uploadProfilePhoto(file).subscribe({
          next: (res) => {
            if (this.user) {
              this.user.profile_photo = res.profile_photo;
            }
            this.photoLoading = false;
            this.toastService.showSuccess('Profile photo updated');
          },
          error: (err) => {
            this.photoLoading = false;
            this.toastService.showError('Failed to upload photo');
          }
        });
      }
    } catch (e) {
      // User cancelled or error
      console.log('Camera error/cancelled', e);
    }
  }

  logout(): void { 
    this.authService.logout(); 
  }
}
