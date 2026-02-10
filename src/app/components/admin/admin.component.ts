import { Component } from '@angular/core';
import { AdminProductosComponent } from "./admin-productos/admin-productos.component";

@Component({
  selector: 'app-admin',
  imports: [AdminProductosComponent],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class AdminComponent {

}
