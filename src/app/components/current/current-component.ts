import { Component, input, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Profile, SupabaseService } from '../../services/supabase.service';
import { CommonModule } from '@angular/common';
import { AuthSession } from '@supabase/supabase-js';

@Component({
  selector: 'current-component',
  templateUrl: './current-component.html',
  imports: [CommonModule, ReactiveFormsModule],
  standalone: true,
})
export class CurrentComponent {
  session = input.required<AuthSession | null>();
  profile = input.required<Profile | null>();
  vaultActive: boolean = false;

  signInForm!: FormGroup;
  constructor(
    private readonly supabase: SupabaseService,
    private readonly formBuilder: FormBuilder
  ) {}

  loading = false;
  ngOnInit() {
    // See if there's a vault currently active
    this.supabase.getSetting('active_vault').then((res) => {
      if (!res) {
        this.vaultActive = false;
      } else {
        this.vaultActive = true;
      }
    });
    this.signInForm = this.formBuilder.group({
      email: '',
      username: '',
    });
  }

  async onSubmit(): Promise<void> {
    try {
      this.loading = true;
      const email = this.signInForm.value.email as string;
      const profile = {
        username: this.signInForm.value.username as string,
        vault_manager: false,
        admin: false,
      } as Profile;
      const { error } = await this.supabase.signIn(email, profile);
      if (error) throw error;
      alert('Check your email for the login link!');
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    } finally {
      this.signInForm.reset();
      this.loading = false;
    }
  }
}
