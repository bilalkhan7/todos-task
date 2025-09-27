import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // If user is unknown, try to refresh; otherwise use current signal
  if (!auth.user()) {
    await auth.refreshSession().catch(() => {});
  }
  if (!auth.user()) {
    router.navigate(['/login']);
    return false;
  }
  return true;
};
