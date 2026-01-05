import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { DetalleProductoComponent } from './components/home/detalle-producto/detalle-producto.component';
import { EmpresaComponent } from './components/lista-empresas/empresa/empresa.component';
import { ListaEmpresasComponent } from './components/lista-empresas/lista-empresas.component';
export const routes: Routes = [

    {path:'',redirectTo:'home',pathMatch:'full'},
    {path:'home', component:HomeComponent},
    {path:'home/detalle-producto/:id',component:DetalleProductoComponent},
    {path:'empresas', component:ListaEmpresasComponent},
    {path:'empresas/empresa/:id',component:EmpresaComponent}
    
];
