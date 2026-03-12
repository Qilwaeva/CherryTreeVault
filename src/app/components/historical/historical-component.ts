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
  lastWorkerCodes = signal<WorkerCodes[]>([]);
  currentWorkerCodes = signal<WorkerCodes[]>([]);
  lastVaultName = signal<string>('');
  currVaultName = signal<string>('');

  constructor(
    private readonly codeService: CodeService,
    private readonly supabase: SupabaseService
  ) {}

  loading = false;
  ngOnInit() {
    this.getAllWorkers();
    this.getLastVaultWorkers();
    this.getCurrentVaultWorkers();
  }

  getAllWorkers() {
    this.loading = true;
    this.supabase
      .getTopWorkers()
      .then((res) => {
        if (res.data != null && res.data.length > 0) {
          this.allWorkers.set(res.data);
          res.data.forEach(async (workerStat: { id: any; username: any; invalid: any; valid: any }) => {
            let workerCode: WorkerCodes = {
              id: workerStat.id,
              username: workerStat.username,
              invalidCodes: workerStat.invalid,
              validCodes: workerStat.valid,
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
      .getLastVaultWorkers()
      .then((res) => {
        if (res.data != null && res.data.length > 0) {
          this.currentWorkers.set(res.data);
          res.data.forEach(async (workerStat: { id: any; username: any; invalid: any; valid: any }) => {
            let workerCode: WorkerCodes = {
              id: workerStat.id,
              username: workerStat.username,
              invalidCodes: workerStat.invalid,
              validCodes: workerStat.valid,
            };
            this.lastWorkerCodes.set([...this.lastWorkerCodes(), workerCode]);
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

  getCurrentVaultWorkers() {
    this.supabase
      .getCurrentVaultWorkers()
      .then((res) => {
        if (res.data != null && res.data.length > 0) {
          this.currentWorkers.set(res.data);
          res.data.forEach(async (workerStat: { id: any; username: any; invalid: any; valid: any }) => {
            let workerCode: WorkerCodes = {
              id: workerStat.id,
              username: workerStat.username,
              invalidCodes: workerStat.invalid,
              validCodes: workerStat.valid,
            };
            this.currentWorkerCodes.set([...this.currentWorkerCodes(), workerCode]);
          });
        }
      })
      .finally(() => {
        this.loading = false;
      });
    this.supabase.getSetting('active_vault').then((res) => {
      this.currVaultName.set(res);
    });
  }

  async getWorkerCodeCount(username: string, status: string) {
    let count = await this.codeService.getWorkerCodeCount(username, status);
    return count;
  }
}
