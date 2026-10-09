import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { environment } from '../../../environments/environment';

export const authGuard: CanActivateFn = async (route, state) => {
  const api = inject(ApiService);
  const router = inject(Router);

  // Production uses ApiService and requires a Clerk session.
  if (environment.designPreview) return true;

  let signed_in = false;
  try {
    signed_in = await api.is_signed_in();
  } catch {
    return router.createUrlTree(['/']);
  }

  if (signed_in) return true;
  else return router.createUrlTree(['/']);
};
