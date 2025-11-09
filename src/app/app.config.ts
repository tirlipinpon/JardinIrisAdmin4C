import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, ErrorHandler } from '@angular/core';
import { PreloadAllModules, provideRouter, withComponentInputBinding, withPreloading } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';

import { routes } from './app.routes';
import { GlobalErrorHandler } from '@jardin-iris/core/data-access';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideBrowserGlobalErrorListeners(),
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    provideHttpClient(withFetch()),
    provideRouter(
      routes, 
      withComponentInputBinding(),
      withPreloading(PreloadAllModules)
    )
  ]
};
