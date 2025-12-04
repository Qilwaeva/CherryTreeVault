import { Component, enableProdMode } from "@angular/core";
import { getConfig } from "./config/config";
import { bootstrapApplication } from "@angular/platform-browser";
import { provideHttpClient } from "@angular/common/http";
import { provideRouter, RouterOutlet } from "@angular/router";
import {MatIconModule, MatIconRegistry} from '@angular/material/icon';
import routeConfig from "./routes";


if (getConfig().env === 'prod') {
  enableProdMode();
}

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, MatIconModule],
    template: `<router-outlet />`,
    standalone: true,
})

class AppComponent {
  constructor(
      private matIconReg: MatIconRegistry
    ) {}
}

bootstrapApplication(AppComponent, {
  providers: [provideRouter(routeConfig), provideHttpClient()]
})
  .catch((err) => console.error(err));
