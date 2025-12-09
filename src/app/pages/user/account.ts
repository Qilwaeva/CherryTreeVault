import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthSession, User } from '@supabase/supabase-js';
import { Profile, SupabaseService } from '../../services/supabase.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-account',
  templateUrl: './account.html',
  imports: [CommonModule, ReactiveFormsModule],
  standalone: true,
})
export class AccountComponent implements OnInit {
  loading = false;
  profile!: Profile;
  updateProfileForm!: FormGroup;

  get avatarUrl() {
    return this.updateProfileForm.value.avatar_url as string;
  }
  async updateAvatar(event: string): Promise<void> {
    this.updateProfileForm.patchValue({
      avatar_url: event,
    });
    await this.updateProfile();
  }

  @Input()
  user!: User;

  constructor(
    private readonly supabase: SupabaseService,
    private formBuilder: FormBuilder
  ) {
    this.updateProfileForm = this.formBuilder.group({
      username: '',
      website: '',
      avatar_url: '',
    });
  }

  async ngOnInit(): Promise<void> {
    await this.getProfile();

    const { username, vault_manager, avatar_url, admin } = this.profile;
    this.updateProfileForm.patchValue({
      username,
      vault_manager,
      avatar_url,
      admin,
    });
  }

  async getProfile() {
    try {
      this.loading = true;
      const { data: profile, error, status } = await this.supabase.profile(this.user);

      if (error && status !== 406) {
        throw error;
      }

      if (profile) {
        this.profile = profile;
      }
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    } finally {
      this.loading = false;
    }
  }

  async updateProfile(): Promise<void> {
    try {
      this.loading = true;

      const username = this.updateProfileForm.value.username as string;
      const vault_manager = this.updateProfileForm.value.vault_manager as boolean;
      const avatar_url = this.updateProfileForm.value.avatar_url as string;
      const admin = this.updateProfileForm.value.admin as boolean;

      const { error } = await this.supabase.updateProfile({
        id: this.user.id,
        username,
        vault_manager,
        avatar_url,
        admin,
      });
      if (error) throw error;
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    } finally {
      this.loading = false;
    }
  }

  // async signOut() {
  //     await this.supabase.signOut()
  // }
}
