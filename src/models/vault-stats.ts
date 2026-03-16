import { Vault } from './vault';

export type VaultStats = {
  totalCodes: number;
  testedCodes: number;
  totalAssignedCodes: number;
  remainingCodes: number;
  removedByHints: number;
  vaultData: Vault | null;
};
