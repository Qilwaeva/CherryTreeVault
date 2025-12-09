import { Component, ElementRef, input, signal, viewChild, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { MarkdownModule } from 'ngx-markdown';
import { CodeService } from '../../../services/code-service';
import { SupabaseService } from '../../../services/supabase.service';
import { AuthSession, User } from '@supabase/supabase-js';
import { VaultCode } from '../../../../models/vault-code';
import { Worker } from '../../../../models/worker';
import { WorkerTask } from '../../../../models/worker-task';

@Component({
  selector: 'manage-codes',
  templateUrl: './manage-codes.html',
  imports: [CommonModule, ReactiveFormsModule, ClipboardModule, MarkdownModule],
  standalone: true,
})
export class ManageCodes {
  user = input.required<User | null>();
  currentWorkers: Worker[] = [];
  workerTasks?: WorkerTask;
  tasksLoading = false;
  copyableCodes = '';

  manageWorkerCodesModal = viewChild.required<ElementRef<HTMLDialogElement>>('manageWorkerCodes');
  selectedWorker?: Worker;

  constructor(
    private readonly codeService: CodeService,
    private readonly supabase: SupabaseService,
    private readonly formBuilder: FormBuilder
  ) {}

  ngOnInit() {
    this.getActiveWorkers();
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
          this.workerTasks = { worker: worker, codes: codeRes };
          console.log();
        }
      })
      .finally(() => {
        this.tasksLoading = false;
      });
  }

  formatCodes() {
    let formatting = ''; // TODO add buttons to decide formatting on re-copy
    let grouping = 0;
    this.codeService.formatCodes(this.workerTasks!.codes, formatting, grouping);
  }
}
