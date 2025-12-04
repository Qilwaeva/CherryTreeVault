import { Component, signal } from "@angular/core";
import { CodeService } from "../services/code-service";

@Component({
    selector: "app-landing",
    templateUrl: "./landing.page.html",
    standalone: true,
})

export class Landing {
  constructor(private readonly codeService: CodeService) {}

  ngOnInit() {
    
  }

  generateCodes() {
    this.codeService.generateAllCodes([1,2], 1, "December 2025")
  }
}