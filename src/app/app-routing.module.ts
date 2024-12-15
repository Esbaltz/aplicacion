import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then( m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then( m => m.HomePageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'cursos',
    loadChildren: () => import('./pages/cursos/cursos.module').then( m => m.CursosPageModule)
  },
  {
    path: 'asistencias',
    loadChildren: () => import('./pages/asistencias/asistencias.module').then( m => m.AsistenciasPageModule)
  },

  {
    path: 'asistencia-prof',
    loadChildren: () => import('./pages/asistencia-prof/asistencia-prof.module').then( m => m.AsistenciaProfPageModule)
  },
  {
    path: 'codigo/:id',
    loadChildren: () => import('./pages/codigo/codigo.module').then( m => m.CodigoPageModule)
  },
  {
    path: 'lista/:id',
    loadChildren: () => import('./pages/lista/lista.module').then( m => m.ListaPageModule)
  },
  {
    path: 'recuperar-psw',
    loadChildren: () => import('./pages/recuperar-psw/recuperar-psw.module').then( m => m.RecuperarPswPageModule)
  },
  {
    path: 'cambiar-ps',
    loadChildren: () => import('./pages/cambiar-ps/cambiar-ps.module').then( m => m.CambiarPsPageModule)
  },

  {
    path: 'registro',
    loadChildren: () => import('./pages/registro/registro.module').then( m => m.RegistroPageModule)
  },
  {
    path: 'agregar-clase',
    loadChildren: () => import('./pages/agregar-clase/agregar-clase.module').then( m => m.AgregarClasePageModule)
  },
  {
    path: 'detalle-clase/:id',
    loadChildren: () => import('./pages/detalle-clase/detalle-clase.module').then( m => m.DetalleClasePageModule)
  },
  {
    path: 'cursos-alumno',
    loadChildren: () => import('./pages/cursos-alumno/cursos-alumno.module').then( m => m.CursosAlumnoPageModule)
  },
  {
    path: 'cursos-disponibles',
    loadChildren: () => import('./pages/cursos-disponibles/cursos-disponibles.module').then( m => m.CursosDisponiblesPageModule)
  },
  {
    path: 'tabs',
    loadChildren: () => import('./pages/tabs/tabs.module').then( m => m.TabsPageModule)
  },
  {
    path: 'cuenta',
    loadChildren: () => import('./pages/cuenta/cuenta.module').then( m => m.CuentaPageModule)
  },




];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
