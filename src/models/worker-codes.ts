import { VaultCode } from './vault-code';
import { Worker } from './worker';

export interface WorkerCodes {
  id: string;
  username: string;
  invalidCodes: number;
  validCodes: number;
}
