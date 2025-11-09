import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app';
import { appConfig } from './app/app.config';
import { VERSION } from '@jardin-iris/core/data-access';

if (typeof window !== 'undefined') {
  (window as any).appVersion = VERSION;
}
bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
