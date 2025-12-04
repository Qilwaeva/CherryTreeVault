import { Injectable } from "@angular/core";
import { VaultCode } from "../../models/vault-code";


@Injectable({ providedIn: "root"})
export class CodeService {

    ngOnInit() {}

    // Generate all the codes we want to test
    generateAllCodes(excludeDigits: number[], codeLength: number, vaultDate: string) {
        var startingCode = ""
        // Get initial all 0s code
        for (let i = 0; i < codeLength; i++) {
            startingCode += "0"
        }
        var validCodes: VaultCode[] = []
        var currentCode = startingCode

        do {
            var valid = true
            // Confirm number contains none of the excluded digits
            for (let digit of excludeDigits) {
                if (currentCode.includes(digit.toString())) {
                    valid = false
                    break
                }
            }

            if (valid) {
                validCodes.push({
                    code: currentCode,
                    status: 'not-started',
                    assignee: null,
                    date: vaultDate,
                    validateOne: null,
                    validateTwo: null
                })
            }
            console.log('code: ' + currentCode)
            var nextCode = parseInt(currentCode) + 1
            currentCode = this.addLeadingZeroes(nextCode, startingCode)
        } while(currentCode.length == codeLength)
        
        console.log('pause')
        // store codes
    }

    // Don't want to lose leading zeroes when converting
    addLeadingZeroes(code: number, startingCode: string): string {
        var paddedCode = code.toString()
        if (startingCode.length > paddedCode.length) {
            for (let i = 0; i < startingCode.length - paddedCode.length; i++) {
                paddedCode = "0" + paddedCode
            }
        }

        return paddedCode
    }

    assignCodes(user: string, numberOfCodes: number): VaultCode[] {
        // query codes where not started
        var newCodes: VaultCode[] = []
        this.updateCodeAssignee(newCodes, user)
        this.updateCodeStatus(newCodes, 'in-progress')

        return newCodes
    }

    updateCodeStatus(codes: VaultCode[], status: 'valid' | 'invalid' | 'in-progress') {

    }

    updateCodeAssignee(codes: VaultCode[], assignee: string | null) {

    }

    // For the first admin validation, just mark them down
    // For the second validation, mark valid and everything else invalid
    markCodeValidated(code: VaultCode, admin: string) {
        if (code.validateOne == null) {
            code.validateOne = admin
        } else if (code.validateTwo == null && code.validateOne != admin) {
            code.validateTwo = admin
            this.updateCodeStatus([code], 'valid')
            // mark all others invalid
        }
    }
}