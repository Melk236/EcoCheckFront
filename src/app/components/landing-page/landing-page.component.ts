import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-landing-page',
  imports: [RouterLink],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export class LandingPage {
  constructor(private auth: AuthService) {}

  get isLoggedIn(): boolean {
    return this.auth.isTokenValid();
  }

  scrollTo(id: string, event: Event): void {
    event.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
  /*Método con el que obtenemos el modo de color del sistema */
  darkMode():boolean{
    const darkMode=window.matchMedia('(prefers-color-scheme: dark)').matches;

    if(darkMode) return true;

    return false;
  }
}
