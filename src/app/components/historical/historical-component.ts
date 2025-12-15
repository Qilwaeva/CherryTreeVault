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
  currentWorkers = signal<Worker[]>([]);
  workerCodes = signal<WorkerCodes[]>([]);

  constructor(
    private readonly codeService: CodeService,
    private readonly supabase: SupabaseService
  ) {}

  loading = false;
  ngOnInit() {
    this.getAllWorkers();
  }

  // TODO add loading
  getAllWorkers() {
    this.supabase.getAllWorkers().then((res) => {
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
          this.workerCodes.set([...this.workerCodes(), workerCode]);
        });
      }
    });
  }

  async getWorkerCodeCount(username: string, status: string) {
    let count = await this.supabase.getCodeCountByWorker(username, status);
    return count;
  }
}
