import { Injectable } from '@angular/core';
import { VaultCode } from '../../models/vault-code';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class CodeService {
  session: any;
  constructor(private readonly supabase: SupabaseService) {}

  ngOnInit() {}

  // Generate all the codes we want to test
  generateAllCodes(excludeDigits: number[], codeLength: number, vaultName: string, session: any) {
    this.session = session;
    var startingCode = '';
    // Get initial all 0s code
    for (let i = 0; i < codeLength; i++) {
      startingCode += '0';
    }
    var validCodes: VaultCode[] = [];
    var currentCode = startingCode;

    do {
      var valid = true;
      // Confirm number contains none of the excluded digits
      for (let digit of excludeDigits) {
        if (currentCode.includes(digit.toString())) {
          valid = false;
          break;
        }
      }

      if (valid) {
        validCodes.push({
          // id: '',
          code: currentCode,
          status: 'not-started',
          assignee: null,
          vaultName: vaultName,
          validateOne: null,
          validateTwo: null,
        });
      }
      // console.log('code: ' + currentCode);
      var nextCode = parseInt(currentCode) + 1;
      currentCode = this.addLeadingZeroes(nextCode, startingCode);
    } while (currentCode.length == codeLength);

    this.supabase.insertCodes(validCodes).then(() => {
      this.supabase.getCodes().then((data) => {
        // TODO remove testing code
        // this.updateCodeAssignee(data.data!, 'testUser1');
        // this.updateCodeStatus(data.data!, 'in-progress');
        console.log('pause');
      });
    });
  }

  // Don't want to lose leading zeroes when converting
  addLeadingZeroes(code: number, startingCode: string): string {
    var paddedCode = code.toString();
    if (startingCode.length > paddedCode.length) {
      for (let i = 0; i < startingCode.length - code.toString().length; i++) {
        paddedCode = '0' + paddedCode;
      }
    }

    return paddedCode;
  }

  async assignCodes(assignee: string, numberOfCodes: number): Promise<VaultCode[]> {
    var newCodes: VaultCode[] = [];
    // query codes where not started
    let activeVault = await this.supabase.getSetting('active_vault');
    let codesRes = await this.supabase.queryNextCodes(numberOfCodes, activeVault);
    if (codesRes && codesRes?.length > 0) {
      newCodes = codesRes;
      this.updateCodeAssignee(newCodes, assignee);
      this.updateCodeStatus(newCodes, 'in-progress');
    }
    return newCodes;
  }

  updateCodeStatus(codes: VaultCode[], status: 'valid' | 'invalid' | 'in-progress') {
    this.supabase.setStatus(codes, status).then(() => {});
  }

  updateCodeAssignee(codes: VaultCode[], assignee: string) {
    this.supabase.getWorker(assignee).then((res) => {
      if (!res) {
        this.supabase.createWorker(assignee).then((res) => {
          this.supabase.setAssignee(codes, res.username);
        });
      } else {
        this.supabase.setAssignee(codes, res.username);
      }
    });
  }

  // For the first admin validation, just mark them down
  // For the second validation, mark valid and everything else invalid
  markCodeValidated(code: VaultCode, admin: string) {
    if (code.validateOne == null) {
      code.validateOne = admin;
      this.supabase.validateCode(code).then((res) => {
        console.log('pause');
      });
    } else if (code.validateTwo == null && code.validateOne != admin) {
      code.validateTwo = admin;
      code.status = 'valid';
      this.supabase.validateCode(code).then((res) => {
        console.log('pause');
      });
      // mark all others invalid
      this.supabase.invalidateAllOtherCodes(code);
    }
  }
}
