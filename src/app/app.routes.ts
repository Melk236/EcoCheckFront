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
import { loginGuard } from './guards/login-guard';
export const routes: Routes = [

    {path:'',redirectTo:'login',pathMatch:'full'},
    {path:'home', component:HomeComponent,canActivate:[loginGuard]},
    {path:'home/detalle-producto/:id',component:DetalleProductoComponent,canActivate:[loginGuard]},
    {path:'empresas', component:ListaEmpresasComponent,canActivate:[loginGuard]},
    {path:'empresas/empresa/:id',component:EmpresaComponent,canActivate:[loginGuard]},
    {path:'login',component:LoginComponent},
    {path:'registro',component:RegistroComponent},
    {path:'perfil', component:ProfileComponent,canActivate:[loginGuard]},
    {path:'admin',component:AdminComponent,canActivate:[adminGuard]},
    {path:'**', redirectTo:'home'}
];
