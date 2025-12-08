import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Profile, SupabaseService } from '../../services/supabase.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'historical-component',
  templateUrl: './historical-component.html',
  imports: [CommonModule, ReactiveFormsModule],
  standalone: true,
})
export class HistoricalComponent {
  signInForm!: FormGroup;
  constructor(
    private readonly supabase: SupabaseService,
    private readonly formBuilder: FormBuilder
  ) {}

  loading = false;
  ngOnInit() {
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
