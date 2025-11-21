import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Loading } from '../../components/loading/loading';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, Loading],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  email: string = '';
  password: string = '';
  loading: boolean = false;
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  async onSubmit(): Promise<void> {
    if (!this.email || !this.password) {
      this.errorMessage = 'Por favor ingrese email y contraseña';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    try {
      const response = await this.authService.login(this.email, this.password).toPromise();
      if (response && response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('currentUser', JSON.stringify(response.user));
        this.router.navigate(['/admin']);
      } else {
        this.errorMessage = 'Credenciales incorrectas';
      }
    } catch (error: any) {
      console.error('Error en login:', error);
      this.errorMessage = error.error?.message || 'Error al iniciar sesión';
    } finally {
      this.loading = false;
    }
  }
}
