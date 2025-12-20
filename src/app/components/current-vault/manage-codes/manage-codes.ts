import { ChangeDetectorRef, Component, effect, ElementRef, input, linkedSignal, output, signal, viewChild, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MarkdownModule } from 'ngx-markdown';
import { CodeService } from '../../../services/code-service';
import { Profile, SupabaseService } from '../../../services/supabase.service';
import { AuthSession, User } from '@supabase/supabase-js';
import { VaultCode } from '../../../../models/vault-code';
import { Worker } from '../../../../models/worker';

interface InvalidList {
  code: VaultCode;
  checked: boolean;
}

@Component({
  selector: 'manage-codes',
  templateUrl: './manage-codes.html',
  imports: [CommonModule, ReactiveFormsModule, MarkdownModule],
  standalone: true,
})
export class ManageCodes {
  user = input.required<User | null>();
  profile = input.required<Profile | null>();
  currentWorkers = input.required<Worker[]>();
  checkActive = output();

  selectedWorker?: Worker;
  workerTasks = signal<VaultCode[]>([]);
  tasksLoading = false;
  copyableCodes = signal<string>('');
  formatKeys = ['None', 'Underlined', 'Bold'];
  formatting = 'None';
  formatCodesForm!: FormGroup;

  validateCodeForm!: FormGroup;
  validateError = signal<string>('');
  validateFeedback = signal<string>('');

  invalidCodeList: InvalidList[] = [];
  selectAll = false;

  manageWorkerCodesModal = viewChild.required<ElementRef<HTMLDialogElement>>('manageWorkerCodes');
  invalidListModal = viewChild.required<ElementRef<HTMLDialogElement>>('invalidList');

  constructor(
    private readonly codeService: CodeService,
    private readonly supabase: SupabaseService,
    private readonly formBuilder: FormBuilder
  ) {}

  ngOnInit() {
    this.formatCodesForm = this.formBuilder.group({
      grouping: 0,
      formatting: 'None',
    });
    this.validateCodeForm = this.formBuilder.group({
      code: '',
    });
  }

  selectWorker(worker: Worker) {
    this.selectedWorker = worker;
    this.manageWorkerCodesModal().nativeElement.showModal();
    this.tasksLoading = true;
    this.getWorkerCodes(worker);
  }

  getWorkerCodes(worker: Worker) {
    this.codeService
      .getWorkerCodes(worker.username)
      .then((codeRes) => {
        if (codeRes != null && codeRes.length > 0) {
          this.workerTasks.set(codeRes);

          this.copyableCodes.set(this.codeService.formatCodes(this.workerTasks()!, 'None', 0));
          // this.formatCodes();
        }
      })
      .finally(() => {
        this.tasksLoading = false;
      });
  }

  validateCode() {
    this.validateFeedback.set('');
    this.validateError.set('');
    let code = this.validateCodeForm.value.code as string;
    let vaultName = '';
    this.supabase.getSetting('active_vault').then((res) => {
      if (res) {
        vaultName = res;
        this.codeService.getCodeByCode(code, vaultName).then((vCode) => {
          if (vCode == null) {
            this.validateError.set('This is not a valid code for the current vault, please resubmit');
          } else {
            let vaultCode = vCode;
            // Give user credit for all the codes they tried before the successful one
            this.codeService.getWorkerCodes(vaultCode.assignee).then((codeRes) => {
              if (codeRes != null && codeRes.length > 0) {
                let codeIndex = codeRes.findIndex((c: VaultCode) => c.code === vaultCode.code);
                let attemptedCodes = codeRes.splice(0, codeIndex);
                this.codeService.updateCodeStatus(attemptedCodes, 'invalid');

                this.codeService.markCodeValidated(vCode, this.profile()!.username).then((res) => {
                  this.validateFeedback.set(res);
                  this.checkActive.emit();
                });
              }
            });
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
    // this.clipboard.copy(this.copyableCodes());

    console.log();
  }

  copyAgain() {
    let discordFormat = this.codeService.discordFormat(this.copyableCodes());
    navigator.clipboard.writeText(discordFormat);
  }

  markInvalid() {
    this.codeService.updateCodeStatus(this.workerTasks(), 'invalid');
    this.workerTasks.set([]);
    this.manageWorkerCodesModal().nativeElement.close();
    this.checkActive.emit();
  }

  unassignCodes() {
    this.codeService.unassignCodes(this.workerTasks()).then(() => {
      this.manageWorkerCodesModal().nativeElement.close();
      this.checkActive.emit();
    });
  }

  prepInvalidList() {
    this.invalidCodeList = this.workerTasks().map((code: VaultCode) => ({
      code: code,
      checked: false,
    }));
    this.invalidListModal().nativeElement.showModal();
  }

  selectAllInvalid() {
    this.selectAll = !this.selectAll;
    if (this.selectAll) {
      this.invalidCodeList = this.invalidCodeList.map((item: InvalidList) => ({ ...item, checked: true }));
    } else {
      this.invalidCodeList = this.invalidCodeList.map((item: InvalidList) => ({ ...item, checked: false }));
    }
  }

  checkItem(list: InvalidList) {
    this.invalidCodeList.find((task) => task.code === list.code)!.checked = !list.checked;
  }

  setCheckedInvalid() {
    let checked = this.invalidCodeList.filter((list) => list.checked == true);
    this.codeService
      .updateCodeStatus(
        checked.map((list) => list.code),
        'invalid'
      )
      .then(() => {
        this.getWorkerCodes(this.selectedWorker!);
        this.invalidListModal().nativeElement.close();
      });
  }
}
