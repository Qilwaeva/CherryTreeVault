import { Component, enableProdMode, importProvidersFrom, OnInit } from '@angular/core';
import { getConfig } from './config/config';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, RouterOutlet } from '@angular/router';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import routeConfig from './routes';
import { MarkdownModule } from 'ngx-markdown';

if (getConfig().env === 'prod') {
  enableProdMode();
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatIconModule],
  template: `<router-outlet />`,
  standalone: true,
})
class AppComponent implements OnInit {
  constructor() {}
  ngOnInit() {}
}

bootstrapApplication(AppComponent, {
  providers: [provideRouter(routeConfig), provideHttpClient(), importProvidersFrom(MarkdownModule.forRoot())],
}).catch((err) => console.error(err));
