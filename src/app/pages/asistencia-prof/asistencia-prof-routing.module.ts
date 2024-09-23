import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AsistenciaProfPage } from './asistencia-prof.page';

const routes: Routes = [
  {
    path: '',
    component: AsistenciaProfPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AsistenciaProfPageRoutingModule {}
