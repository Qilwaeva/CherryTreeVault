import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Profile, SupabaseService } from '../../services/supabase.service';
import { CommonModule } from '@angular/common';
import { CodeService } from '../../services/code-service';
import { Worker } from '../../../models/worker';
import { WorkerCodes } from '../../../models/worker-codes';

@Component({
  selector: 'historical-component',
  templateUrl: './historical-component.html',
  imports: [CommonModule, ReactiveFormsModule],
  standalone: true,
})
export class HistoricalComponent {
  allWorkers = signal<Worker[]>([]);
  currentWorkers = signal<Worker[]>([]);
  allWorkerCodes = signal<WorkerCodes[]>([]);
  currentWorkerCodes = signal<WorkerCodes[]>([]);
  lastVaultName = signal<string>('');

  constructor(
    private readonly codeService: CodeService,
    private readonly supabase: SupabaseService
  ) {}

  loading = false;
  ngOnInit() {
    this.getAllWorkers();
    this.getLastVaultWorkers();
  }

  getAllWorkers() {
    this.loading = true;
    this.supabase
      .getAllWorkers()
      .then((res) => {
        if (res.data != null && res.data.length > 0) {
          this.allWorkers.set(res.data);
          this.allWorkers().forEach(async (worker) => {
            let invalidCount = await this.getWorkerCodeCount(worker.username, 'invalid');
            let validCount = await this.getWorkerCodeCount(worker.username, 'valid');
            let workerCode: WorkerCodes = {
              worker: worker,
              invalidCodes: invalidCount,
              validCodes: validCount,
            };
            this.allWorkerCodes.set([...this.allWorkerCodes(), workerCode]);
          });
        }
      })
      .finally(() => {
        this.loading = false;
      });
  }

  getLastVaultWorkers() {
    this.supabase
      .getCurrentWorkers()
      .then((res) => {
        if (res.data != null && res.data.length > 0) {
          this.currentWorkers.set(res.data);
          this.currentWorkers().forEach(async (worker) => {
            let invalidCount = await this.getWorkerCodeCount(worker.username, 'invalid');
            let validCount = await this.getWorkerCodeCount(worker.username, 'valid');
            let workerCode: WorkerCodes = {
              worker: worker,
              invalidCodes: invalidCount,
              validCodes: validCount,
            };
            this.currentWorkerCodes.set([...this.currentWorkerCodes(), workerCode]);
          });
        }
      })
      .finally(() => {
        this.loading = false;
      });
    this.supabase.getSetting('last_vault').then((res) => {
      this.lastVaultName.set(res);
    });
  }

  async getWorkerCodeCount(username: string, status: string) {
    let count = await this.supabase.getCodeCountByWorker(username, status);
    return count;
  }
}
