import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const canActivate: CanActivateFn = async (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const { data } = await auth.getUser();
  if (!data.user) {
    router.navigate(['/login']);
    return false;
  }
  return true;
}; 