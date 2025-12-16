import { Component, signal } from '@angular/core';
import { CodeService } from '../services/code-service';
import { Profile, SupabaseService } from '../services/supabase.service';
import { AuthComponent } from '../pages/user/auth';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthSession, User } from '@supabase/supabase-js';
import { AccountComponent } from './user/account';
import { VaultCode } from '../../models/vault-code';
import { ActivitySwitcher } from '../components/activity-switcher/activity-switcher';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.page.html',
  imports: [CommonModule, ActivitySwitcher, AuthComponent, RouterLink, RouterLinkActive],
  standalone: true,
})
export class Landing {
  profile = signal<Profile | null>(null);
  user = signal<User | null>(null);

  litSayings = [
    'a dingdong',
    'a Path of Pain completer',
    'a big baby',
    'a stinky Sentinel',
    'a cute lil candle',
    'the best bug squasher',
    'a prideful Halo owner',
    'a Krampus Candle',
    "Mandii's favorite candle",
    'a butt',
    'a deLIGHT',
  ];
  activeLitSaying = signal<string>('');

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

  logout() {
    this.supabase.signOut();
    this.router.navigate(['/']);
  }

  generateLitSaying() {
    this.activeLitSaying.set(this.litSayings[Math.floor(Math.random() * this.litSayings.length)]);
  }
}
