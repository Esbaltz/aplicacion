import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CursosAlumnoPage } from './cursos-alumno.page';

const routes: Routes = [
  {
    path: '',
    component: CursosAlumnoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CursosAlumnoPageRoutingModule {}
