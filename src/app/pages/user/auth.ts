import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Profile, SupabaseService } from '../../services/supabase.service';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.html',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, RouterLinkActive],
  standalone: true,
})
export class AuthComponent {
  signUpForm!: FormGroup;
  signInForm!: FormGroup;
  constructor(
    private readonly supabase: SupabaseService,
    private readonly formBuilder: FormBuilder
  ) {}

  loading = false;
  ngOnInit() {
    this.signUpForm = this.formBuilder.group({
      email: '',
      password: '',
      username: '',
    });
    this.signInForm = this.formBuilder.group({
      email: '',
      password: '',
    });
  }

  //   document.addEventListener('DOMContentLoaded', function () {
  //     const passIn = document.getElementById('password');
  //     const btn = document.getElementById('togglePassword');
  //     btn.addEventListener('click', function () {
  //         const type =
  //             passIn.getAttribute('type') ===
  //                 'password' ? 'text' : 'password';
  //         passIn.setAttribute('type', type);
  //     });
  //     const loginForm = document.getElementById('loginForm');
  //     loginForm.addEventListener('submit', function (event) {
  //         event.preventDefault();
  //         loginForm.reset(); // Reset the form
  //         alert('Form submitted');
  //     });
  // });

  async onSubmit(): Promise<void> {
    try {
      this.loading = true;
      const email = this.signUpForm.value.email as string;
      const password = this.signUpForm.value.password as string;
      const profile = {
        username: this.signUpForm.value.username as string,
        vault_manager: false,
        admin: false,
      } as Profile;
      // const { error } = await this.supabase.signIn(email, profile);
      const { error } = await this.supabase.signUpPass(email, password, profile);
      if (error) throw error;
      alert('Check your email to confirm!');
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    } finally {
      this.signUpForm.reset();
      this.loading = false;
    }
  }

  async signIn(): Promise<void> {
    try {
      this.loading = true;
      const email = this.signInForm.value.email as string;
      const password = this.signInForm.value.password as string;
      // const { error } = await this.supabase.signIn(email, profile);
      const { data, error } = await this.supabase.signInPass(email, password);
      console.log();
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    } finally {
      this.signUpForm.reset();
      this.loading = false;
    }
  }
}
