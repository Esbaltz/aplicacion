import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VistaTemporalPage } from './vista-temporal.page';

const routes: Routes = [
  {
    path: '',
    component: VistaTemporalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VistaTemporalPageRoutingModule {}
