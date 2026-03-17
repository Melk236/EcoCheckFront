import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { DetalleProductoComponent } from './components/home/detalle-producto/detalle-producto.component';
import { EmpresaComponent } from './components/lista-empresas/empresa/empresa.component';
import { ListaEmpresasComponent } from './components/lista-empresas/lista-empresas.component';
import { LoginComponent } from './components/login/login.component';
import { RegistroComponent } from './components/registro/registro.component';
import { ProfileComponent } from './components/profile/profile.component';
import { AdminComponent } from './components/admin/admin.component';
import { adminGuard} from './guards/admin-guard';
import { tokenGuard } from './guards/token-guard';
import { loginGuard } from './guards/login-guard-guard';
export const routes: Routes = [

    {path:'',redirectTo:'login',pathMatch:'full'},
    {path:'home', component:HomeComponent,canActivate:[tokenGuard]},
    {path:'home/detalle-producto/:id',component:DetalleProductoComponent,canActivate:[tokenGuard]},
    {path:'empresas', component:ListaEmpresasComponent,canActivate:[tokenGuard]},
    {path:'empresas/empresa/:id',component:EmpresaComponent,canActivate:[tokenGuard]},
    {path:'login',component:LoginComponent,canActivate:[loginGuard]},
    {path:'registro',component:RegistroComponent,canActivate:[loginGuard]},
    {path:'perfil', component:ProfileComponent,canActivate:[tokenGuard]},
    {path:'admin',component:AdminComponent,canActivate:[adminGuard]},
    {path:'**', redirectTo:'home'}
];
