import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, catchError, of } from 'rxjs';

export const loginGuard: CanActivateFn = (route, state) => {
  
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isTokenValid()) {
    return true;
  }

  return authService.refreshToken().pipe(
    map((tokens: any) => {
      authService.setToken(tokens.token);
      return true;
    }),
    catchError(() => {
      authService.removeToken();
      router.navigate(['/login']);
      return of(false);
    })
  );
};
