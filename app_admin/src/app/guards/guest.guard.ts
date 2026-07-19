import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router,
  UrlTree
} from '@angular/router';

import { AuthenticationService } from '../services/authentication.service';

export const guestGuard: CanActivateFn = (): boolean | UrlTree => {
  const authenticationService = inject(AuthenticationService);
  const router = inject(Router);

  if (authenticationService.isLoggedIn()) {
    return router.createUrlTree(['']);
  }

  return true;
};