import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children:[
      {
        path: 'cursos',
        loadChildren: () => import('../cursos/cursos.module').then(m => m.CursosPageModule)
      },
      {
        path: 'asistencias',
        loadChildren: () => import('../asistencias/asistencias.module').then(m => m.AsistenciasPageModule)
      },
      {
        path: 'cuenta',
        loadChildren: () => import('../cuenta/cuenta.module').then(m => m.CuentaPageModule)
      },
      {
        path: 'asistencia-prof',
        loadChildren: () => import('../asistencia-prof/asistencia-prof.module').then(m => m.AsistenciaProfPageModule)
      },
      {
        path: 'cursos-alumno',
        loadChildren: () => import('../cursos-alumno/cursos-alumno.module').then(m => m.CursosAlumnoPageModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsPageRoutingModule {}
