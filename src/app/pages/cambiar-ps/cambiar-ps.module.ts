import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CambiarPsPageRoutingModule } from './cambiar-ps-routing.module';

import { CambiarPsPage } from './cambiar-ps.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CambiarPsPageRoutingModule
  ],
  declarations: [CambiarPsPage]
})
export class CambiarPsPageModule {}
