export type VaultCode = {
  //   id: string;
  code: string;
  status: 'valid' | 'invalid' | 'in-progress' | 'not-started';
  assignee: string | null;
  vaultName: string;
  validateOne: string | null;
  validateTwo: string | null;
};
