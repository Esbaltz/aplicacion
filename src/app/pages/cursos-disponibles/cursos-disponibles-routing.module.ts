import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CursosDisponiblesPage } from './cursos-disponibles.page';

const routes: Routes = [
  {
    path: '',
    component: CursosDisponiblesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CursosDisponiblesPageRoutingModule {}
