import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AnunciosPage } from './anuncios.page';

const routes: Routes = [
  {
    path: '',
    component: AnunciosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AnunciosPageRoutingModule {}
