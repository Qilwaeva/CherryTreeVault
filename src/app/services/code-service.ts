import { Injectable } from '@angular/core';
import { VaultCode } from '../../models/vault-code';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class CodeService {
  constructor(private readonly supabase: SupabaseService) {}

  ngOnInit() {}

  // Generate all the codes we want to test
  async generateAllCodes(excludeDigits: string[], codeLength: number, vaultName: string) {
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
        if (currentCode.includes(digit)) {
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
      var nextCode = parseInt(currentCode) + 1;
      currentCode = this.addLeadingZeroes(nextCode, startingCode);
    } while (currentCode.length == codeLength);

    let codeWait = await this.supabase.insertCodes(validCodes);
    let vaultConfirm = await this.supabase.createNewVault(vaultName);
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
      await this.updateCodeAssignee(newCodes, assignee).then(async () => {
        await this.updateCodeStatus(newCodes, 'in-progress').then(() => {});
      });
    }
    return newCodes;
  }

  async updateCodeStatus(codes: VaultCode[], status: 'valid' | 'invalid' | 'in-progress') {
    let data = await this.supabase.setStatus(codes, status);
    return data;
  }

  async updateCodeAssignee(codes: VaultCode[], assignee: string) {
    this.supabase.getWorker(assignee).then(async (res) => {
      if (!res) {
        await this.supabase.createWorker(assignee).then(async (res) => {
          await this.supabase.setAssignee(codes, res.username).then(() => {});
        });
      } else {
        await this.supabase.setAssignee(codes, res.username).then(() => {});
      }
    });
  }

  async unassignCodes(codes: VaultCode[]) {
    await this.supabase.unassignCodes(codes);
  }

  // For the first admin validation, just mark them down
  // For the second validation, mark valid and everything else invalid
  async markCodeValidated(code: VaultCode, vaultMgr: string) {
    let validateFeedback = '';
    if (code.validateOne == null) {
      code.validateOne = vaultMgr;
      await this.supabase.validateCode(code).then((res) => {
        validateFeedback = 'Validation successful. Once another manager validates, the vault will close';
      });
    } else if (code.validateTwo == null && code.validateOne != vaultMgr) {
      code.validateTwo = vaultMgr;
      code.status = 'valid';
      await this.supabase.validateCode(code).then((res) => {
        validateFeedback = 'Validation successful. The vault will now be closed';
      });
      // mark all others invalid
      await this.supabase.invalidateAllOtherCodes(code);
    } else {
      validateFeedback = 'You have either already validated this code, or someone beat you to the second validation';
    }
    return validateFeedback;
  }

  // Add formatting and spaces between letters to satisfy discord
  formatCodes(assignedCodes: VaultCode[], formatting: string, grouping: number): string {
    let lastCode = assignedCodes[0];
    let currentCode: VaultCode;
    let copyableCodes = '';

    if (formatting != 'None') {
      for (let j = 0; j < assignedCodes[0].code.length; j++) {
        copyableCodes = copyableCodes + assignedCodes[0].code.at(j) + ' ';
      }
    } else {
      copyableCodes = assignedCodes[0].code;
    }
    // One less than total since we start with one loaded
    for (let i = 1; i < assignedCodes.length; i++) {
      currentCode = assignedCodes[i];
      let numberString = '<br>';
      if (formatting != 'None') {
        // Loop over numbers and apply any formatting
        for (let j = 0; j < currentCode.code.length; j++) {
          if (lastCode.code.at(j) != currentCode.code.at(j)) {
            if (formatting == 'Bold') {
              numberString = numberString + '**' + currentCode.code.at(j) + '** ';
            } else {
              numberString = numberString + '<u>' + currentCode.code.at(j) + '</u> ';
            }
          } else {
            numberString = numberString + currentCode.code.at(j) + ' ';
          }
        }
      } else {
        numberString = numberString + currentCode.code + ' ';
      }

      if (grouping != 0) {
        // Extra newline for grouping
        if ((i + 1) % grouping == 0) {
          numberString = numberString + '<br>';
        }
      }
      copyableCodes = copyableCodes + numberString;
      lastCode = currentCode;
    }
    return copyableCodes;
  }

  // Convert to discord formatting
  discordFormat(copyableCodes: string): string {
    let ulRegexOpen = '<u>';
    let ulRegexClose = '</u>';
    let brRegex = '<br>'; // TODO: discord newline not working
    let discordMd = copyableCodes.replaceAll(ulRegexOpen, '__');
    discordMd = discordMd.replaceAll(ulRegexClose, '__');
    discordMd = discordMd.replaceAll(brRegex, '\r\n');
    return discordMd;
  }
}
