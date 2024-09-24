import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CambiarPsPage } from './cambiar-ps.page';

const routes: Routes = [
  {
    path: '',
    component: CambiarPsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CambiarPsPageRoutingModule {}
