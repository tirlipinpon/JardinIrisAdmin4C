import { Injectable } from '@angular/core';
import { SupabaseService } from '../../shared/services/supabase.service';


@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private supabase: SupabaseService) {}

  signIn(email: string, password: string) {
    return this.supabase.client.auth.signInWithPassword({ email, password });
  }

  signOut() {
    return this.supabase.client.auth.signOut();
  }

  getUser() {
    return this.supabase.client.auth.getUser();
  }

  signUp({ email, password }: { email: string, password: string }) {
    return this.supabase.client.auth.signUp({ email, password });
  }
} 