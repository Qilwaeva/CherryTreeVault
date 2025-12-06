import { VaultCode } from './vault-code';
import { Worker } from './worker';

export interface WorkerTask {
  worker: Worker;
  codes: VaultCode[];
}
