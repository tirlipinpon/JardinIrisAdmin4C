import { bootstrapApplication } from '@angular/platform-browser';
import { provideZonelessChangeDetection } from '@angular/core';
import { App } from './app/app';
import { VERSION } from './app/shared/services/version';

if (typeof window !== 'undefined') {
  (window as any).appVersion = VERSION;
}
bootstrapApplication(App, {
  providers: [
    provideZonelessChangeDetection()
  ]
})
  .catch((err) => console.error(err));
