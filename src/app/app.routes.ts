import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { DetalleProductoComponent } from './components/home/detalle-producto/detalle-producto.component';
import { EmpresaComponent } from './components/lista-empresas/empresa/empresa.component';
import { ListaEmpresasComponent } from './components/lista-empresas/lista-empresas.component';
import { LoginComponent } from './components/login/login.component';
import { RegistroComponent } from './components/registro/registro.component';
import { ProfileComponent } from './components/profile/profile.component';
import { AdminComponent } from './components/admin/admin.component';
export const routes: Routes = [

    {path:'',redirectTo:'login',pathMatch:'full'},
    {path:'home', component:HomeComponent},
    {path:'home/detalle-producto/:id',component:DetalleProductoComponent},
    {path:'empresas', component:ListaEmpresasComponent},
    {path:'empresas/empresa/:id',component:EmpresaComponent},
    {path:'login',component:LoginComponent},
    {path:'registro',component:RegistroComponent},
    {path:'perfil', component:ProfileComponent},
    {path:'admin',component:AdminComponent},
    {path:'**', redirectTo:'home'}
];
