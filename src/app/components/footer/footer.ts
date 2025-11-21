import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrls: ['./footer.scss']
})
export class Footer {
  currentYear = new Date().getFullYear();

  constructor(private router: Router) {}

  scrollToInfo(event: Event): void {
    event.preventDefault();

    // Si no estamos en la página principal, navegar primero
    if (this.router.url !== '/') {
      this.router.navigate(['/']).then(() => {
        // Esperar a que la navegación se complete y el DOM se actualice
        setTimeout(() => {
          const element = document.getElementById('info');
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      });
    } else {
      // Ya estamos en la página principal, solo hacer scroll
      const element = document.getElementById('info');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }
}