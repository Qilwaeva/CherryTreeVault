import { ChangeDetectorRef, Component, effect, ElementRef, input, linkedSignal, output, signal, viewChild, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MarkdownModule } from 'ngx-markdown';
import { CodeService } from '../../../services/code-service';
import { Profile, SupabaseService } from '../../../services/supabase.service';
import { AuthSession, User } from '@supabase/supabase-js';
import { VaultCode } from '../../../../models/vault-code';
import { Worker } from '../../../../models/worker';
import { VaultStats } from '../../../../models/vault-stats';

interface InvalidList {
  code: VaultCode;
  checked: boolean;
}

@Component({
  selector: 'add-hints',
  templateUrl: './add-hints.html',
  imports: [CommonModule, ReactiveFormsModule, MarkdownModule],
  standalone: true,
})
export class AddHints {
  profile = input.required<Profile | null>();

  addHintsForm!: FormGroup;
  submitLoading = false;
  hintValue = '';
  codesRemoved = 0;
  displayOutput = false;

  constructor(
    private readonly codeService: CodeService,
    private readonly supabase: SupabaseService,
    private readonly formBuilder: FormBuilder
  ) {}

  ngOnInit() {
    this.addHintsForm = this.formBuilder.group({
      hintValue: '',
    });
  }

  async onSubmitRequest(): Promise<void> {
    let currVault = await this.codeService.getSetting('active_vault');
    let oldVaultStats = await this.codeService.getVaultStats(currVault);
    try {
      this.submitLoading = true;
      this.hintValue = this.addHintsForm.value.hintValue as string;
      await this.codeService.applyHintFromStart(this.hintValue, this.profile()!.username);
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
        this.submitLoading = false;
      }
    } finally {
      this.submitLoading = false;
      let newVaultStats = await this.codeService.getVaultStats(currVault);
      this.codesRemoved = oldVaultStats.remainingCodes - newVaultStats.remainingCodes;
      this.displayOutput = true;
    }
  }

  reset() {
    this.addHintsForm = this.formBuilder.group({
      hintValue: '',
    });
    this.displayOutput = false;
  }
}
