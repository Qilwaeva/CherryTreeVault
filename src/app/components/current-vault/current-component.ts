import { Component, input, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Profile, SupabaseService } from '../../services/supabase.service';
import { CommonModule } from '@angular/common';
import { AuthSession } from '@supabase/supabase-js';
import { CodeForm } from '../../../models/code-form';
import { CodeService } from '../../services/code-service';
import { VaultCode } from '../../../models/vault-code';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { MarkdownModule } from 'ngx-markdown';
import { ManageCodes } from './manage-codes/manage-codes';

@Component({
  selector: 'current-component',
  templateUrl: './current-component.html',
  imports: [CommonModule, ReactiveFormsModule, ClipboardModule, MarkdownModule, ManageCodes],
  standalone: true,
})
export class CurrentComponent {
  session = input.required<AuthSession | null>();
  profile = input.required<Profile | null>();
  vaultActive: boolean = false;
  formatKeys = ['None', 'Underlined', 'Bold'];

  assignCodesForm!: FormGroup;
  constructor(
    private readonly codeService: CodeService,
    private readonly supabase: SupabaseService,
    private readonly formBuilder: FormBuilder
  ) {}

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
  copyableCodes = '';

  ngOnInit() {
    // See if there's a vault currently active
    // this.supabase.getSetting('active_vault').then((res) => {
    //   if (!res) {
    //     this.vaultActive = false;
    //   } else {
    //     this.vaultActive = true;
    //   }
    // }); TODO
    this.assignCodesForm = this.formBuilder.group({
      username: '',
      quantity: 0,
      grouping: 0,
      formatting: 'None',
    });
    this.vaultActive = true;
  }

  changeFormatting(event: any) {
    this.requestForm.formatting = event.target.value;
  }

  async onSubmit(): Promise<void> {
    try {
      this.submitLoading = true;
      this.requestForm.worker = this.assignCodesForm.value.username as string;
      this.requestForm.totalCodes = this.assignCodesForm.value.quantity as number;
      this.requestForm.grouping = this.assignCodesForm.value.grouping as number;
      this.validateValues();
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

  validateValues() {
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
        this.formatOutput();
      }
    });
  }

  formatOutput() {
    // this.assignedCodes = [
    //   {
    //     code: '1234',
    //     status: 'not-started',
    //     assignee: null,
    //     vaultName: '',
    //     validateOne: null,
    //     validateTwo: null,
    //   },
    //   {
    //     code: '1235',
    //     status: 'not-started',
    //     assignee: null,
    //     vaultName: '',
    //     validateOne: null,
    //     validateTwo: null,
    //   },
    //   {
    //     code: '1245',
    //     status: 'not-started',
    //     assignee: null,
    //     vaultName: '',
    //     validateOne: null,
    //     validateTwo: null,
    //   },
    // ];
    let lastCode = this.assignedCodes[0];
    let currentCode: VaultCode;
    this.copyableCodes = this.assignedCodes[0].code;
    // One less than total since we start with one loaded
    for (let i = 1; i < this.assignedCodes.length; i++) {
      currentCode = this.assignedCodes[i];
      let numberString = '<br>';
      if (this.requestForm.formatting != 'None') {
        // Loop over numbers and apply any formatting
        for (let j = 0; j < currentCode.code.length; j++) {
          if (lastCode.code.at(j) != currentCode.code.at(j)) {
            if (this.requestForm.formatting == 'Bold') {
              numberString = numberString + '**' + currentCode.code.at(j) + '**';
            } else {
              numberString = numberString + '<u>' + currentCode.code.at(j) + '</u>';
            }
          } else {
            numberString = numberString + currentCode.code.at(j);
          }
        }
        console.log('pause');
      } else {
        numberString = numberString + currentCode.code;
      }

      // Extra newline for grouping
      if (this.requestForm.grouping % (i + 1) == 0) {
        numberString = numberString + '<br>';
      }
      this.copyableCodes = this.copyableCodes + numberString;
      lastCode = currentCode;
    }
  }

  // Convert to discord formatting
  discordFormat(): string {
    let ulRegexOpen = '<u>';
    let ulRegexClose = '</u>';
    let brRegex = '<br>'; // TODO: discord newline not working
    let discordMd = this.copyableCodes.replaceAll(ulRegexOpen, '__');
    discordMd = discordMd.replaceAll(ulRegexClose, '__');
    discordMd = discordMd.replaceAll(brRegex, '  ');
    return discordMd;
  }
}
