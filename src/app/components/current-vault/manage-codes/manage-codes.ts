import { Component, input, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { MarkdownModule } from 'ngx-markdown';
import { CodeService } from '../../../services/code-service';
import { SupabaseService } from '../../../services/supabase.service';
import { AuthSession } from '@supabase/supabase-js';
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
  session = input.required<AuthSession | null>();
  currentWorkers: Worker[] = [];
  workerTasks: WorkerTask[] = [];

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
        for (let worker of this.currentWorkers) {
          this.supabase.getCodesByWorker(worker.username).then((codeRes) => {
            if (codeRes != null && codeRes.length > 0) {
              let task: WorkerTask = { worker: worker, codes: codeRes };
              this.workerTasks.push(task);
              console.log();
            }
          });
        }
      }
    });
  }
}
