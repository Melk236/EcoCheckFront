import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { DetalleProductoComponent } from './components/home/detalle-producto/detalle-producto.component';

export const routes: Routes = [

    {path:'',redirectTo:'home',pathMatch:'full'},
    {path:'home', component:HomeComponent},
    {path:'home/detalle-producto/:id',component:DetalleProductoComponent}
    
];
