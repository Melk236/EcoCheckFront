import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  dropdownOpen = false;
  constructor(private router: Router) { }

  isActive(route: string): boolean {
    return this.router.url.includes(route);
  }
}
