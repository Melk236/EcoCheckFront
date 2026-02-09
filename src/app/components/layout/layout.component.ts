import { Component } from '@angular/core';
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
  constructor(private route: Router) { }

  /*Comprobamos que la ruta actual no sea ni el login ni el registro */
  comprobarRuta(): boolean {
    if (this.route.url !== '/login' && this.route.url !== '/registro' && this.route.url !== '/landing') return true;

    return false;
  }
}
