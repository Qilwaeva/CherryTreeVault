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
  user: User | null = null;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  get session() {
    this.supabase.auth.getSession().then(({ data }) => {
      this._session = data.session;
    });
    return this._session;
  }

  getUser() {
    this.supabase.auth.getUser().then(({ data }) => {
      this.user = data.user;
    });
    return this.user;
  }

  profile(user: User) {
    let data = this.supabase.from('profiles').select(`username, vault_manager, avatar_url, admin`).eq('id', user.id).single();
    return data;
  }

  worker(username: string) {
    let data = this.supabase.from('workers').select('*').eq('username', username).single();
    return data;
  }

  authChanges(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    return this.supabase.auth.onAuthStateChange(callback);
  }

  signIn(email: string, profile: Profile) {
    return this.supabase.auth.signInWithOtp({
      email,
      options: {
        // emailRedirectTo: window.location.origin,
        data: {
          username: profile.username,
          admin: profile.admin,
          vault_manager: profile.vault_manager,
        },
      },
    });
  }

  signUpPass(email: string, password: string, profile: Profile) {
    return this.supabase.auth.signUp({
      email,
      password,
      options: {
        // emailRedirectTo: window.location.origin,
        data: {
          username: profile.username,
          admin: profile.admin,
          vault_manager: profile.vault_manager,
        },
      },
    });
  }

  signInPass(email: string, password: string) {
    return this.supabase.auth.signInWithPassword({
      email,
      password: password,
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

  async insertCodes(codes: VaultCode[]) {
    // for (let code of codes) {
    await this.supabase
      .from('VaultCode')
      .insert(codes)
      .select()
      .then(({ data }) => {
        return data;
      });
    // }
  }

  async getCodes() {
    let data = await this.supabase.from('VaultCode').select('*');
    return data;
  }

  async setAssignee(codes: VaultCode[], assignee: string) {
    await this.supabase
      .from('VaultCode')
      .update([
        {
          assignee: assignee,
        },
      ])
      .eq('vaultName', codes[0].vaultName)
      .in(
        'code',
        codes.map((c) => c.code)
      );
  }

  async setStatus(codes: VaultCode[], status: 'valid' | 'invalid' | 'in-progress') {
    await this.supabase
      .from('VaultCode')
      .update([
        {
          status: status,
        },
      ])
      .eq('vaultName', codes[0].vaultName)
      .in(
        'code',
        codes.map((c) => c.code)
      );
  }

  // Get worker, or create one if one doesn't exist
  async getWorker(username: string) {
    let { data: worker, error, status } = await this.worker(username);
    // This is just from returning no results, is not an error
    if (error && status !== 406) {
      throw error;
    }
    if (!worker) {
      // return this.createWorker(username);
      return null;
    } else {
      return worker;
    }
  }

  async createWorker(username: string) {
    let data = await this.supabase
      .from('workers')
      .insert([{ username: username, codes_attempted: 0, vaults_participated: 0, correct_codes: 0 }])
      .select()
      .single();
    return data.data;
  }

  // Get all workers with codes currently in progress
  async getCurrentWorkers() {
    let data = await this.supabase.from('workers').select('*, VaultCode!inner()').eq('VaultCode.status', 'in-progress');
    return data;
  }

  async getCodesByWorker(username: string) {
    let data = await this.supabase.from('VaultCode').select('*').eq('assignee', username);
    return data.data;
  }

  async validateCode(code: VaultCode) {
    let data = await this.supabase
      .from('VaultCode')
      .update([
        {
          status: code.status,
          validateOne: code.validateOne,
          validateTwo: code.validateTwo,
        },
      ])
      .eq('vaultName', code.vaultName)
      .eq('code', code.code);
    return data;
  }

  // Set all codes but specified to invalid
  async invalidateAllOtherCodes(code: VaultCode) {
    let data = await this.supabase
      .from('VaultCode')
      .update([
        {
          status: 'invalid',
        },
      ])
      .eq('vaultName', code.vaultName)
      .neq('code', code.code);
    // let data = await this.supabase.from('VaultCode').select('*').eq('vaultName', code.vaultName).neq('code', code.code);
    return data;
  }

  async getSetting(name: string) {
    let data = await this.supabase.from('Settings').select('*').eq('setting_name', name).single();
    return data.data.setting_value;
  }

  // Find the next X codes in the given vault
  async queryNextCodes(number: number, vaultName: string) {
    let data = await this.supabase.from('VaultCode').select('*').eq('vaultName', vaultName).eq('status', 'not-started').limit(number);
    return data.data;
  }
}
