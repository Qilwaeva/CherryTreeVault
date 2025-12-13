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

@Component({
  selector: 'current-component',
  templateUrl: './current-component.html',
  imports: [CommonModule, ReactiveFormsModule, ClipboardModule, MarkdownModule, ManageCodes],
  standalone: true,
})
export class CurrentComponent {
  user = input.required<User | null>();
  profile = input.required<Profile | null>();

  vaultActive = signal<boolean>(false);
  vaultName = signal<string>('');
  formatKeys = ['None', 'Underlined', 'Bold'];
  refresh = signal<boolean>(false);

  totalCodes = signal<number>(0);
  testedCodes = signal<number>(0);
  totalAssignedCodes = signal<number>(0);
  remainingCodes = signal<number>(0);

  assignCodesForm!: FormGroup;
  vaultForm!: FormGroup;
  constructor(
    private readonly codeService: CodeService,
    private readonly supabase: SupabaseService,
    private readonly formBuilder: FormBuilder
  ) {}

  submitLoading = false;
  generateLoading = false;
  requestForm: CodeForm = {
    worker: '',
    totalCodes: 0,
    grouping: 0,
    formatting: 'None',
  };
  validationError = '';
  submitValid = true;
  assignedCodes: VaultCode[] = [];
  copyableCodes = signal<string>('');

  ngOnInit() {
    this.checkActiveVault();
    this.assignCodesForm = this.formBuilder.group({
      username: '',
      quantity: 0,
      grouping: 0,
      formatting: 'None',
    });
    this.vaultForm = this.formBuilder.group({
      vaultName: '',
      totalDigits: 0,
      excludeDigits: [],
    });
    // this.vaultActive = true;
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

  changeFormatting(event: any) {
    this.requestForm.formatting = event.target.value;
  }

  async onSubmitRequest(): Promise<void> {
    try {
      this.submitLoading = true;
      this.requestForm.worker = this.assignCodesForm.value.username as string;
      this.requestForm.totalCodes = this.assignCodesForm.value.quantity as number;
      this.requestForm.grouping = this.assignCodesForm.value.grouping as number;
      await this.validateValues();
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
        this.submitLoading = false;
      }
    } finally {
      if (this.submitValid) {
        this.requestCodes();
        this.assignCodesForm.reset();
      }
      this.submitLoading = false;
    }
  }

  async validateValues() {
    if (this.requestForm.worker.length < 1) {
      this.validationError = 'Worker name must be at least 1 character';
      this.submitValid = false;
    } else {
      await this.supabase.getCodesByWorker(this.requestForm.worker).then((codes) => {
        if (codes != null && codes.length > 0) {
          this.validationError = 'This worker already has codes assigned';
          this.submitValid = false;
        }
      });
    }
    if (this.requestForm.totalCodes < 1 || this.requestForm.totalCodes > 80) {
      this.validationError = 'Please enter a number of codes between 1 and 80\r\n';
      this.submitValid = false;
    }
    if (this.requestForm.grouping > this.requestForm.totalCodes || this.requestForm.grouping < 1) {
      this.validationError = 'Grouping value must be between 1 and number of codes';
      this.submitValid = false;
    }
  }

  requestCodes() {
    this.codeService.assignCodes(this.requestForm.worker, this.requestForm.totalCodes).then((res) => {
      this.assignedCodes = res;
      if (this.requestForm.totalCodes > this.requestForm.grouping) {
        this.copyableCodes.set(this.codeService.formatCodes(this.assignedCodes, this.requestForm.formatting, this.requestForm.grouping));
        this.refresh.set(true);
      }
    });
  }

  discordFormat() {
    navigator.clipboard.writeText(this.codeService.discordFormat(this.copyableCodes()));
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
      if (this.submitValid) {
        // this.requestCodes();
        this.vaultForm.reset();
      }
      this.generateLoading = false;
      this.checkActiveVault();
    }
  }
}
