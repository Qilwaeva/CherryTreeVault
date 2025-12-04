import { CommonModule } from "@angular/common";
import { Component, isStandalone } from "@angular/core";
import { RouterOutlet } from "@angular/router";
// import { TopBar } from "../components/top-bar";

@Component({
    standalone: true,
    imports: [RouterOutlet, CommonModule],
    templateUrl: "default.layout.html",
})
export class LayoutDefault {
    ngOnInit() {
        //things we want to eventually init right on page load
    }
}