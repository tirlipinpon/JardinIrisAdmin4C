import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { VERSION } from './app/shared/services/version';

if (typeof window !== 'undefined') {
  (window as any).appVersion = VERSION;
}
bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
