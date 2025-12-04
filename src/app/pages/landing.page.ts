import { Component, signal } from "@angular/core";
import { CodeService } from "../services/code-service";
import { Profile, SupabaseService } from "../services/supabase.service";
import { AuthComponent } from "../pages/user/auth";
import { CommonModule } from "@angular/common";
import { Router, RouterOutlet } from "@angular/router";

@Component({
    selector: "app-landing",
    templateUrl: "./landing.page.html",
    imports: [CommonModule, AuthComponent],
    standalone: true,
})

export class Landing {
  profile!: Profile
  constructor(
    private readonly supabase: SupabaseService,
    private readonly codeService: CodeService,
        private router: Router
  ) {}

    session = this.supabase.session;
    ngOnInit() {
        this.supabase.authChanges(async (_, session) => {
            if (session) {
                this.session = session
                const user = session.user
                this.supabase.profile(user).then(({data, error, status}) => {
                    if (error && status !== 406) {
                        throw error
                    }
                    if (data) {
                        this.profile = data
                    }
                    console.log("pause")
                })
                
            }
        });
    }

  generateCodes() {
    this.codeService.generateAllCodes([1,2], 1, "December 2025")
  }

  logout() {
    this.supabase.signOut()
    this.router.navigate(['/']);
  }
}