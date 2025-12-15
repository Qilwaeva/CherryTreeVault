import { VaultCode } from './vault-code';
import { Worker } from './worker';

export interface WorkerCodes {
  worker: Worker;
  invalidCodes: number;
  validCodes: number;
}
