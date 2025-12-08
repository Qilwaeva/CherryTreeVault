import { CommonModule } from '@angular/common';
import { Component, computed, inject, isStandalone } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Profile, SupabaseService } from '../services/supabase.service';
import { AuthComponent } from '../pages/user/auth';
import { AccountComponent } from '../pages/user/account';
// import { TopBar } from "../components/top-bar";

@Component({
  standalone: true,
  imports: [RouterOutlet, CommonModule, AuthComponent],
  templateUrl: 'default.layout.html',
})
export class LayoutDefault {
  profile!: Profile;
  constructor(private readonly supabase: SupabaseService) {}

  session: any;
  user: any;
  ngOnInit() {
    this.session = this.supabase.session;
    this.user = this.supabase.getUser();
    this.supabase.authChanges((_, session) => (this.session = session));
  }
}
