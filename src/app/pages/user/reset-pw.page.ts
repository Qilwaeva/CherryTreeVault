import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthSession, User } from '@supabase/supabase-js';
import { Profile, SupabaseService } from '../../services/supabase.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  templateUrl: './reset-pw.page.html',
  imports: [CommonModule, ReactiveFormsModule],
  standalone: true,
})
export class ResetPassword {
  pwReset!: FormGroup;

  constructor(
    private readonly supabase: SupabaseService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.pwReset = this.formBuilder.group({
      password: '',
    });
  }

  updatePassword() {
    const password = this.pwReset.value.password as string;
    this.supabase.updatePassword(password);
    alert('Your password has been reset');
    this.router.navigate(['/home']);
  }
}
