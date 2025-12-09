import { ChangeDetectorRef, Component, ElementRef, input, signal, viewChild, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Clipboard } from '@angular/cdk/clipboard';
import { MarkdownModule } from 'ngx-markdown';
import { CodeService } from '../../../services/code-service';
import { Profile, SupabaseService } from '../../../services/supabase.service';
import { AuthSession, User } from '@supabase/supabase-js';
import { VaultCode } from '../../../../models/vault-code';
import { Worker } from '../../../../models/worker';
import { WorkerTask } from '../../../../models/worker-task';

@Component({
  selector: 'manage-codes',
  templateUrl: './manage-codes.html',
  imports: [CommonModule, ReactiveFormsModule, MarkdownModule],
  standalone: true,
})
export class ManageCodes {
  user = input.required<User | null>();
  profile = input.required<Profile | null>();
  currentWorkers: Worker[] = [];
  workerTasks = signal<VaultCode[]>([]);
  tasksLoading = false;
  copyableCodes = signal<string>('');
  formatKeys = ['None', 'Underlined', 'Bold'];
  formatting = 'None';
  formatCodesForm!: FormGroup;
  validateCodeForm!: FormGroup;
  validateError = signal<string>('');

  manageWorkerCodesModal = viewChild.required<ElementRef<HTMLDialogElement>>('manageWorkerCodes');
  selectedWorker?: Worker;

  constructor(
    private readonly codeService: CodeService,
    private readonly supabase: SupabaseService,
    private readonly formBuilder: FormBuilder,
    private clipboard: Clipboard
  ) {}

  ngOnInit() {
    this.getActiveWorkers();

    this.formatCodesForm = this.formBuilder.group({
      grouping: 0,
      formatting: 'None',
    });
    this.validateCodeForm = this.formBuilder.group({
      code: '',
    });
  }

  getActiveWorkers() {
    this.supabase.getCurrentWorkers().then((res) => {
      if (res.data != null && res.data.length > 0) {
        this.currentWorkers = res.data;
      }
    });
  }

  selectWorker(worker: Worker) {
    this.selectedWorker = worker;
    this.manageWorkerCodesModal().nativeElement.showModal();
    this.tasksLoading = true;
    this.getWorkerCodes(worker);
  }

  getWorkerCodes(worker: Worker) {
    this.supabase
      .getCodesByWorker(worker.username)
      .then((codeRes) => {
        if (codeRes != null && codeRes.length > 0) {
          this.workerTasks.set(codeRes);
          // this.formatCodes();
        }
      })
      .finally(() => {
        this.tasksLoading = false;
      });
  }

  validateCode() {
    this.validateError.set('');
    let code = this.validateCodeForm.value.code as string;
    let vaultName = '';
    this.supabase.getSetting('active_vault').then((res) => {
      if (res) {
        vaultName = res;
        this.supabase.getCodebyCode(code, vaultName).then((vCode) => {
          if (vCode == null) {
            this.validateError.set('This is not a valid code for the current vault, please resubmit');
          } else {
            let vaultCode = vCode;
            this.codeService.markCodeValidated(vCode, this.profile()!.username);
          }
        });
      }
    });
  }

  changeFormatting(event: any) {
    this.formatting = event.target.value;
  }

  formatCodes() {
    let grouping = this.formatCodesForm.value.grouping as number;
    this.copyableCodes.set(this.codeService.formatCodes(this.workerTasks()!, this.formatting, grouping));
    this.clipboard.copy(this.copyableCodes());

    console.log();
  }

  copyAgain() {
    this.copyableCodes.set(this.codeService.discordFormat(this.copyableCodes()));
    this.clipboard.copy(this.copyableCodes());
  }
}
