import { ChangeDetectorRef, Component, effect, ElementRef, input, linkedSignal, output, signal, viewChild, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MarkdownModule } from 'ngx-markdown';
import { CodeService } from '../../../services/code-service';
import { Profile, SupabaseService } from '../../../services/supabase.service';
import { AuthSession, User } from '@supabase/supabase-js';
import { VaultCode } from '../../../../models/vault-code';
import { CodeForm } from '../../../../models/code-form';
import { Worker } from '../../../../models/worker';

@Component({
  selector: 'assign-codes',
  templateUrl: './assign-codes.html',
  imports: [CommonModule, ReactiveFormsModule, MarkdownModule],
  standalone: true,
})
export class AssignCodes {
  user = input.required<User | null>();
  profile = input.required<Profile | null>();

  formatKeys = ['None', 'Underlined', 'Bold'];
  allWorkers = input.required<Worker[]>();
  checkActive = output();

  assignCodesForm!: FormGroup;
  workerDropdown = signal<string>('');

  submitLoading = false;
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

  constructor(
    private readonly codeService: CodeService,
    private readonly supabase: SupabaseService,
    private readonly formBuilder: FormBuilder
  ) {}

  ngOnInit() {
    this.assignCodesForm = this.formBuilder.group({
      userdropdown: '',
      username: '',
      quantity: '',
      grouping: '',
      formatting: 'None',
    });
  }

  changeFormatting(event: any) {
    this.requestForm.formatting = event.target.value;
  }

  changeWorker(event: any) {
    this.workerDropdown.set(event.target.value);
  }

  async onSubmitRequest(): Promise<void> {
    try {
      this.submitLoading = true;
      if (this.workerDropdown() === 'New Worker') {
        this.requestForm.worker = this.assignCodesForm.value.username as string;
      } else {
        this.requestForm.worker = this.workerDropdown() as string;
      }
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
        // this.assignCodesForm.reset();
        this.reset();
      }
      this.submitLoading = false;
    }
  }

  async validateValues() {
    if (this.requestForm.worker.length < 1) {
      this.validationError = 'Worker name must be at least 1 character';
      this.submitValid = false;
    } else {
      await this.supabase.getCodesByWorker(this.requestForm.worker, 'in-progress').then((codes) => {
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

        this.checkActive.emit();
      }
    });
  }

  discordFormat() {
    navigator.clipboard.writeText(this.codeService.discordFormat(this.copyableCodes()));
  }

  reset() {
    this.assignCodesForm = this.formBuilder.group({
      userdropdown: '',
      username: '',
      quantity: '',
      grouping: '',
      formatting: 'None',
    });
  }
}
