import { Component, ElementRef, signal, viewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Profile, SupabaseService } from '../../services/supabase.service';
import { CommonModule } from '@angular/common';
import { CodeService } from '../../services/code-service';
import { Worker } from '../../../models/worker';
import { WorkerCodes } from '../../../models/worker-codes';
import { User } from '@supabase/supabase-js';

@Component({
  selector: 'manage-users',
  templateUrl: './manage.page.html',
  imports: [CommonModule, ReactiveFormsModule],
  standalone: true,
})
export class PageManageUsers {
  allUsers = signal<Profile[]>([]);
  selectedUser?: Profile;
  confirmation = signal<string>('');

  manageUserModal = viewChild.required<ElementRef<HTMLDialogElement>>('manageUser');

  constructor(
    private readonly codeService: CodeService,
    private readonly supabase: SupabaseService
  ) {}

  loading = false;
  ngOnInit() {
    this.confirmation.set('');
    this.getAllUsers();
  }

  getAllUsers() {
    this.loading = true;
    this.supabase
      .getAllUsers()
      .then((res) => {
        if (res.data != null && res.data.length > 0) {
          this.allUsers.set(res.data);
        }
      })
      .finally(() => {
        this.loading = false;
      });
  }

  selectUser(user: Profile) {
    this.selectedUser = user;
    this.manageUserModal().nativeElement.showModal();
  }

  giveVaultMgr() {
    this.confirmation.set('');
    if (!this.selectedUser) {
      return;
    }
    this.selectedUser.vault_manager = true;
    this.supabase.updateProfile(this.selectedUser).then(() => {
      this.confirmation.set('User has been granted Vault Manager permissions, you may close this window');
    });
  }

  removeVaultMgr() {
    this.confirmation.set('');
    if (!this.selectedUser) {
      return;
    }
    this.selectedUser.vault_manager = false;
    this.supabase.updateProfile(this.selectedUser).then(() => {
      this.confirmation.set('User has had Vault Manager permissions removed, you may close this window');
    });
  }
}
