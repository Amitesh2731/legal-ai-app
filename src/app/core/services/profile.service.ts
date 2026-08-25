import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { User, AdvocateProfile } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  constructor(private api: ApiService) {}

  getClientProfile(): Observable<User> {
    return this.api.get<User>('/clients/me');
  }

  updateClientProfile(data: Partial<User>): Observable<User> {
    return this.api.put<User>('/clients/me', data);
  }

  getAdvocateProfile(): Observable<AdvocateProfile> {
    return this.api.get<AdvocateProfile>('/advocates/me');
  }

  updateAdvocateProfile(data: Partial<AdvocateProfile>): Observable<AdvocateProfile> {
    return this.api.put<AdvocateProfile>('/advocates/me', data);
  }

  uploadProfilePhoto(file: File): Observable<{ profile_photo: string }> {
    const formData = new FormData();
    formData.append('file', file);
    // Overriding the default content type because FormData needs the browser to set boundary
    return this.api.post<{ profile_photo: string }>('/auth/profile-photo', formData);
  }
}
