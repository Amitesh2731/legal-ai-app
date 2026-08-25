export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  role_id: string;
  is_active: boolean;
  status: string;
  is_verified: boolean;
  last_login?: string;
  profile_photo?: string;
  role?: Role;
}

export interface Role {
  id: string;
  name: string;
}

export interface AdvocateProfile {
  id: string;
  user_id: string;
  specialization?: string;
  bar_council_number?: string;
  experience_years?: number;
  bio?: string;
  status: string;
  user?: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface TokenPayload {
  sub: string;
  exp: number;
  type: string;
}
