import { Component, signal } from '@angular/core';
import { CodeService } from '../services/code-service';
import { Profile, SupabaseService } from '../services/supabase.service';
import { AuthComponent } from '../pages/user/auth';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { AuthSession, User } from '@supabase/supabase-js';
import { AccountComponent } from './user/account';
import { VaultCode } from '../../models/vault-code';
import { ActivitySwitcher } from '../components/activity-switcher/activity-switcher';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.page.html',
  imports: [CommonModule, ActivitySwitcher],
  standalone: true,
})
export class Landing {
  profile = signal<Profile | null>(null);
  user = signal<User | null>(null);

  constructor(
    private readonly supabase: SupabaseService,
    private readonly codeService: CodeService,
    private router: Router
  ) {}

  ngOnInit() {
    this.supabase.authChanges((type, session) => {
      if (type != 'TOKEN_REFRESHED') {
        // don't need to go get the whole user again if only refreshing
        this.user.set(this.supabase.user);
        if (this.user()) {
          this.getProfile();
        }
      }
    });
  }

  async getProfile() {
    try {
      let { data: profile, error, status } = await this.supabase.profile(this.user()!);

      if (error && status !== 406) {
        throw error;
      }

      if (profile) {
        this.profile.set(profile);
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
    }
  }

  generateCodes() {
    this.supabase.getCurrentWorkers().then((res) => {
      console.log();
    });
    // this.codeService.generateAllCodes([1, 2, 3, 4, 5, 6], 2, 'December1 2025', this.session());
    // let code: VaultCode = {
    //   code: '00000707',
    //   status: 'in-progress',
    //   assignee: null,
    //   vaultName: 'December 2025',
    //   validateOne: null,
    //   validateTwo: null,
    // };
    // this.codeService.markCodeValidated(code, 'name');
    // this.codeService.markCodeValidated(code, 'name2');
  }

  logout() {
    // this.supabase.signOut();
    this.router.navigate(['/']);
  }
}
