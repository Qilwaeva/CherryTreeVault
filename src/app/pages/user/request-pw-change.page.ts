import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthSession, User } from '@supabase/supabase-js';
import { Profile, SupabaseService } from '../../services/supabase.service';
import { CommonModule } from '@angular/common';

@Component({
  templateUrl: './request-pw-change.page.html',
  imports: [CommonModule, ReactiveFormsModule],
  standalone: true,
})
export class RequestPwChange {
  pwReset!: FormGroup;

  constructor(
    private readonly supabase: SupabaseService,
    private formBuilder: FormBuilder
  ) {
    this.pwReset = this.formBuilder.group({
      email: '',
    });
  }

  sendPasswordReset() {
    const email = this.pwReset.value.email as string;
    this.supabase.resetPassword(email);
    alert('Check your email for a password reset link');
  }
}
