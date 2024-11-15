import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AgregarClasePage } from './agregar-clase.page';

const routes: Routes = [
  {
    path: '',
    component: AgregarClasePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AgregarClasePageRoutingModule {}
