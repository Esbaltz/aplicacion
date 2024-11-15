import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DetalleClasePageRoutingModule } from './detalle-clase-routing.module';

import { DetalleClasePage } from './detalle-clase.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DetalleClasePageRoutingModule
  ],
  declarations: [DetalleClasePage]
})
export class DetalleClasePageModule {}
