export type VaultCode = {
    code: string;
    status: 'valid' | 'invalid' | 'in-progress' | 'not-started';
    assignee: string | null;
    date: string;
    validateOne: string | null;
    validateTwo: string | null;
}