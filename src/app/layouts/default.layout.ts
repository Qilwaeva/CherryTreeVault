import { CommonModule } from "@angular/common";
import { Component, computed, inject, isStandalone } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { Profile, SupabaseService } from "../services/supabase.service";
import { AuthComponent } from "../pages/user/auth";
// import { TopBar } from "../components/top-bar";


@Component({
    standalone: true,
    imports: [RouterOutlet, CommonModule],
    templateUrl: "default.layout.html",
})
export class LayoutDefault {
    profile!: Profile
    constructor(
        private readonly supabase: SupabaseService
    ) {
        
    }
    
    // session = this.supabase.session;
    // ngOnInit() {
    //     this.supabase.authChanges(async (_, session) => {
    //         if (session) {
    //             this.session = session
    //             const user = session.user
    //             this.supabase.profile(user).then(({data, error, status}) => {
    //                 if (error && status !== 406) {
    //                     throw error
    //                 }
    //                 if (data) {
    //                     this.profile = data
    //                 }
    //                 console.log("pause")
    //             })
                
    //         }
    //     });
    // }
}