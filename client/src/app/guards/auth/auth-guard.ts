import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { ApiService } from '../../services/api.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const api = inject(ApiService);
  const router = inject(Router);

  const signed_in = await api.is_signed_in();

  if (signed_in)
    return true;
  else
    return router.createUrlTree(["/"]);
};
