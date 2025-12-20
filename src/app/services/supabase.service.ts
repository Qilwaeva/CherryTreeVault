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
  vaultCodeTable = '';
  settingsTable = '';
  workersTable = '';
  vaultsTable = '';
  baseUrl = '';

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
    this.vaultCodeTable = environment.code_table_name;
    this.settingsTable = environment.settings_table_name;
    this.workersTable = environment.workers_table_name;
    this.vaultsTable = environment.vault_table_name;
    this.baseUrl = environment.api.base;
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

  async getAllUsers() {
    let data = await this.supabase.from('profiles').select('*');
    return data;
  }

  profile(user: User) {
    let data = this.supabase.from('profiles').select(`username, vault_manager, avatar_url, admin`).eq('id', user.id).single();
    return data;
  }

  worker(username: string) {
    let data = this.supabase.from(this.workersTable).select('*').eq('username', username).single();
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

  resetPassword(email: string) {
    return this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: this.baseUrl + '/update-password',
    });
  }

  updatePassword(newPassword: string) {
    return this.supabase.auth.updateUser({
      password: newPassword,
    });
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

  async createVault(vaultName: string, createdBy: string, excludeDigits: string, codeCount: number) {
    await this.supabase
      .from(this.vaultsTable)
      .insert([{ vault_name: vaultName, created_by: createdBy, exclude_digits: excludeDigits, code_count: codeCount }])
      .select()
      .then(({ data }) => {
        return data;
      });
  }

  async insertCodes(codes: VaultCode[]) {
    // for (let code of codes) {
    await this.supabase
      .from(this.vaultCodeTable)
      .insert(codes)
      .select()
      .then(({ data }) => {
        return data;
      });
    // }
  }

  async getAllCodes() {
    let data = await this.supabase.from(this.vaultCodeTable).select('*').order('code', { ascending: true });
    return data;
  }

  async setAssignee(codes: VaultCode[], assignee: string) {
    let data = await this.supabase
      .from(this.vaultCodeTable)
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
    return data;
  }

  async unassignCodes(codes: VaultCode[]) {
    let data = await this.supabase
      .from(this.vaultCodeTable)
      .update([
        {
          assignee: null,
        },
      ])
      .eq('vaultName', codes[0].vaultName)
      .in(
        'code',
        codes.map((c) => c.code)
      );
    return data;
  }

  async setStatus(codes: VaultCode[], status: 'valid' | 'invalid' | 'in-progress') {
    let data = await this.supabase
      .from(this.vaultCodeTable)
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
    return data;
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
      .from(this.workersTable)
      .insert([{ username: username, codes_attempted: 0, vaults_participated: 0, correct_codes: 0 }])
      .select()
      .single();
    return data.data;
  }

  // Get all workers with codes currently in progress
  async getCurrentWorkers() {
    let data = await this.supabase
      .from(this.workersTable)
      .select('*, ' + this.vaultCodeTable + '!inner()')
      .eq(this.vaultCodeTable + '.status', 'in-progress');
    return data as any;
  }

  // Get all workers
  async getAllWorkers() {
    let data = await this.supabase.from(this.workersTable).select('*');
    return data;
  }

  async getCodesByWorker(username: string, status: string) {
    let data = await this.supabase
      .from(this.vaultCodeTable)
      .select('*')
      .eq('assignee', username)
      .eq('status', status)
      .order('code', { ascending: true });
    return data.data;
  }

  async getCodeCountByWorker(username: string, status: string): Promise<number> {
    let data = await this.supabase
      .from(this.vaultCodeTable)
      .select('*', { count: 'exact', head: true })
      .eq('assignee', username)
      .eq('status', status);
    return data.count || 0;
  }

  async validateCode(code: VaultCode) {
    let data = await this.supabase
      .from(this.vaultCodeTable)
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
      .from(this.vaultCodeTable)
      .update([
        {
          status: 'invalid',
        },
      ])
      .eq('vaultName', code.vaultName)
      .neq('code', code.code);
    // let data = await this.supabase.from(this.vaultCodeTable).select('*').eq('vaultName', code.vaultName).neq('code', code.code);
    await this.closeVault();
    return data;
  }

  async getSetting(name: string) {
    let data = await this.supabase.from(this.settingsTable).select('*').eq('setting_name', name).single();
    return data.data.setting_value;
  }

  async createNewVault(name: string) {
    let data = await this.supabase
      .from(this.settingsTable)
      .update([
        {
          setting_value: name,
        },
      ])
      .eq('setting_name', 'active_vault');
    return data.data;
  }

  // Get vault total codes, codes tested, and codes waiting
  async getVaultStats(vaultName: string): Promise<any> {
    let dataTotal = await this.supabase.from(this.vaultCodeTable).select('*', { count: 'exact', head: true }).eq('vaultName', vaultName);
    let dataInvalid = await this.supabase
      .from(this.vaultCodeTable)
      .select('*', { count: 'exact', head: true })
      .eq('vaultName', vaultName)
      .eq('status', 'invalid');
    let dataAssigned = await this.supabase
      .from(this.vaultCodeTable)
      .select('*', { count: 'exact', head: true })
      .eq('vaultName', vaultName)
      .eq('status', 'in-progress');
    let dataRemaining = await this.supabase
      .from(this.vaultCodeTable)
      .select('*', { count: 'exact', head: true })
      .eq('vaultName', vaultName)
      .eq('status', 'not-started');
    let vaultData = await this.supabase.from(this.vaultsTable).select('*').eq('vault_name', vaultName).single();
    return {
      total: dataTotal.count,
      invalid: dataInvalid.count,
      assigned: dataAssigned.count,
      remaining: dataRemaining.count,
      vaultData: vaultData,
    };
  }

  async closeVault() {
    let currVault = await this.supabase.from(this.settingsTable).select('*').eq('setting_name', 'active_vault').single();
    let ageConf = await this.supabase
      .from(this.settingsTable)
      .update([
        {
          setting_value: currVault.data.setting_value,
        },
      ])
      .eq('setting_name', 'last_vault');
    let remActive = await this.supabase
      .from(this.settingsTable)
      .update([
        {
          setting_value: null,
        },
      ])
      .eq('setting_name', 'active_vault');
    return remActive;
  }

  // Find the next X codes in the given vault
  async queryNextCodes(number: number, vaultName: string) {
    let data = await this.supabase
      .from(this.vaultCodeTable)
      .select('*')
      .eq('vaultName', vaultName)
      .eq('status', 'not-started')
      .order('code', { ascending: true })
      .limit(number);
    return data.data;
  }

  async getCodebyCode(code: string, vaultName: string) {
    let data = await this.supabase.from(this.vaultCodeTable).select('*').eq('code', code).eq('vaultName', vaultName).single();
    return data.data;
  }
}
