import { Component, input, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Profile, SupabaseService } from '../../services/supabase.service';
import { CommonModule } from '@angular/common';
import { AuthSession, User } from '@supabase/supabase-js';
import { CodeForm } from '../../../models/code-form';
import { CodeService } from '../../services/code-service';
import { VaultCode } from '../../../models/vault-code';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { MarkdownModule } from 'ngx-markdown';
import { ManageCodes } from './manage-codes/manage-codes';
import { VaultForm } from '../../../models/vault-form';
import { AssignCodes } from './assign-codes/assign-codes';
import { Worker } from '../../../models/worker';

@Component({
  selector: 'current-component',
  templateUrl: './current-component.html',
  imports: [CommonModule, ReactiveFormsModule, ClipboardModule, MarkdownModule, ManageCodes, AssignCodes],
  standalone: true,
})
export class CurrentComponent {
  user = input.required<User | null>();
  profile = input.required<Profile | null>();

  vaultActive = signal<boolean>(false);
  vaultName = signal<string>('');
  currentWorkers = signal<Worker[]>([]);
  allWorkers = signal<Worker[]>([]);

  totalCodes = signal<number>(0);
  testedCodes = signal<number>(0);
  totalAssignedCodes = signal<number>(0);
  remainingCodes = signal<number>(0);

  assignCodesForm!: FormGroup;
  vaultForm!: FormGroup;

  generateLoading = false;

  constructor(
    private readonly codeService: CodeService,
    private readonly supabase: SupabaseService,
    private readonly formBuilder: FormBuilder
  ) {}

  ngOnInit() {
    this.checkActiveVault();
    this.getActiveWorkers();
    this.getAllWorkers();
    this.vaultForm = this.formBuilder.group({
      vaultName: '',
      totalDigits: 0,
      excludeDigits: [],
    });
  }

  checkActiveVault() {
    // See if there's a vault currently active
    this.supabase.getSetting('active_vault').then((res) => {
      if (!res) {
        this.vaultActive.set(false);
      } else {
        this.vaultActive.set(true);
        this.vaultName.set(res);
        this.supabase.getVaultStats(res).then((stats) => {
          this.totalCodes.set(stats.total);
          this.testedCodes.set(stats.invalid);
          this.totalAssignedCodes.set(stats.assigned);
          this.remainingCodes.set(stats.remaining);
        });
      }
    });
  }

  async generateVault() {
    try {
      this.generateLoading = true;
      let vaultName = this.vaultForm.value.vaultName as string;
      let totalDigits = this.vaultForm.value.totalDigits as number;
      let excludeNum = this.vaultForm.value.excludeDigits as number;
      let excludeDigits = excludeNum.toString().split('');
      let generate = await this.codeService.generateAllCodes(excludeDigits, totalDigits, vaultName);
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
        this.generateLoading = false;
      }
    } finally {
      this.generateLoading = false;
      this.checkActiveVault();
    }
  }

  getActiveWorkers() {
    this.supabase.getCurrentWorkers().then((res) => {
      if (res.data != null && res.data.length > 0) {
        this.currentWorkers.set(res.data);
      }
    });
  }

  getAllWorkers() {
    this.supabase.getAllWorkers().then((res) => {
      if (res.data != null && res.data.length > 0) {
        this.allWorkers.set(res.data);
      }
    });
  }
}
