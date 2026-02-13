import { Component, HostListener } from '@angular/core';
import { SidebarComponent } from "../sidebar/sidebar.component";
import { Router, RouterOutlet } from "@angular/router";
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-layout',
  imports: [SidebarComponent, RouterOutlet, CommonModule],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {
  isLargeScreen = false;

  constructor(private route: Router) {
    this.checkScreenSize();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  checkScreenSize() {
    this.isLargeScreen = window.innerWidth >= 1024;
  }

  /*Comprobamos que la ruta actual no sea ni el login ni el registro */
  comprobarRuta(): boolean {
    if (this.route.url !== '/login' && this.route.url !== '/registro' && this.route.url !== '/landing') return true;

    return false;
  }

  tieneSidebar(): boolean {
    return this.comprobarRuta() && this.isLargeScreen;
  }
}
