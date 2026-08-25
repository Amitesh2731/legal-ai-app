import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { RouteReuseStrategy, provideRouter, withComponentInputBinding, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { APP_INITIALIZER } from '@angular/core';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { jwtInterceptor } from './app/core/interceptors/jwt.interceptor';
import { AuthService } from './app/core/services/auth.service';

export function initializeAuth(authService: AuthService) {
  return () => authService.initAuth();
}

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular({ mode: 'md' }),
    provideAnimations(),
    provideHttpClient(withInterceptors([jwtInterceptor])),
    provideRouter(routes, withPreloading(PreloadAllModules), withComponentInputBinding()),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAuth,
      deps: [AuthService],
      multi: true
    }
  ],
});
