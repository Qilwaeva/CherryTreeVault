import { Injectable } from '@angular/core';
import { AuthChangeEvent, AuthSession, createClient, Session, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { VaultCode } from '../../models/vault-code';

export interface Profile {
  id?: string;
  username: string;
  vault_manager: boolean;
  avatar_url: string;
  admin: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  supabase: SupabaseClient;
  _session: AuthSession | null = null;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  get session() {
    this.supabase.auth.getSession().then(({ data }) => {
      this._session = data.session;
    });
    return this._session;
  }

  profile(user: User) {
    let data = this.supabase.from('profiles').select(`username, vault_manager, avatar_url, admin`).eq('id', user.id).single();
    return data;
  }

  authChanges(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    return this.supabase.auth.onAuthStateChange(callback);
  }

  signIn(email: string, profile: Profile) {
    return this.supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          username: profile.username,
          admin: profile.admin,
          vault_manager: profile.vault_manager,
        },
      },
    });
  }

  signOut() {
    return this.supabase.auth.signOut();
  }

  updateProfile(profile: Profile) {
    const update = {
      ...profile,
      updated_at: new Date(),
    };

    return this.supabase.from('profiles').upsert(update);
  }

  downLoadImage(path: string) {
    return this.supabase.storage.from('avatars').download(path);
  }

  uploadAvatar(filePath: string, file: File) {
    return this.supabase.storage.from('avatars').upload(filePath, file);
  }

  insertRows(codes: VaultCode[]) {
    for (let code of codes) {
      this.supabase
        .from('VaultCode')
        .insert([
          {
            code: code.code,
            status: code.status,
            assignee: code.assignee,
            name: code.name,
            validateOne: code.validateOne,
            validateTwo: code.validateTwo,
          },
        ])
        .select()
        .then(({ data }) => {
          return data;
        });
    }
  }
}
