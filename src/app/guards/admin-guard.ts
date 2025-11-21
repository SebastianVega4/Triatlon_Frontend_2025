import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { LoginModalService } from '../services/login-modal.service';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(
    private authService: AuthService, 
    private router: Router,
    private loginModalService: LoginModalService
  ) {}

  canActivate(): Promise<boolean> {
    return new Promise((resolve) => {
      // Primero verificar si hay un token válido
      if (!this.authService.isAuthenticated()) {
        // No hay token, abrir modal y redirigir
        this.loginModalService.openModal();
        this.router.navigate(['/']);
        resolve(false);
        return;
      }

      // Si hay token, verificar con el servidor
      this.authService.getCurrentUser().pipe(
        take(1),
        map(user => {
          if (user) {
            return true;
          } else {
            // Token inválido o expirado
            this.loginModalService.openModal();
            this.router.navigate(['/']);
            return false;
          }
        })
      ).subscribe({
        next: (isValid) => resolve(isValid),
        error: () => {
          // Error al verificar usuario (token inválido)
          this.loginModalService.openModal();
          this.router.navigate(['/']);
          resolve(false);
        }
      });
    });
  }
}