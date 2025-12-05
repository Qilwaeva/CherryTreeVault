import { Component, signal } from '@angular/core';
import { CodeService } from '../services/code-service';
import { Profile, SupabaseService } from '../services/supabase.service';
import { AuthComponent } from '../pages/user/auth';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { AuthSession } from '@supabase/supabase-js';
import { AccountComponent } from './user/account';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.page.html',
  imports: [CommonModule],
  standalone: true,
})
export class Landing {
  profile!: Profile;
  constructor(
    private readonly supabase: SupabaseService,
    private readonly codeService: CodeService,
    private router: Router
  ) {}
  // session = this.supabase.session;
  session = signal<AuthSession | null>(null);
  ngOnInit() {
    this.supabase.authChanges((_, session) => {
      this.session.set(session);
      if (this.session()) {
        // check auth change types
        this.getProfile();
      }
    });
  }

  async getProfile() {
    try {
      let { data: profile, error, status } = await this.supabase.profile(this.session()!.user);

      if (error && status !== 406) {
        throw error;
      }

      if (profile) {
        this.profile = profile;
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
    }
  }

  generateCodes() {
    this.codeService.generateAllCodes([1, 2], 1, 'December 2025');
  }

  logout() {
    this.supabase.signOut();
    this.router.navigate(['/']);
  }
}
