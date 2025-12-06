import { Component, input, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Profile, SupabaseService } from '../../services/supabase.service';
import { CommonModule } from '@angular/common';
import { HistoricalComponent } from '../historical/historical-component';
import { CurrentComponent } from '../current-vault/current-component';
import { AuthSession } from '@supabase/supabase-js';

enum Activity {
  'Historical',
  'CurrentVault',
}

@Component({
  selector: 'activity-switcher',
  templateUrl: './activity-switcher.html',
  imports: [CommonModule, ReactiveFormsModule, HistoricalComponent, CurrentComponent],
  standalone: true,
})
export class ActivitySwitcher {
  Activity = Activity;
  activity = signal<Activity>(Activity.CurrentVault);
  session = input.required<AuthSession | null>();
  profile = input.required<Profile | null>();
  constructor() {}

  ngOnInit() {}
}
