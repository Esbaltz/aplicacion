import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AgregarClasePageRoutingModule } from './agregar-clase-routing.module';

import { AgregarClasePage } from './agregar-clase.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AgregarClasePageRoutingModule
  ],
  declarations: [AgregarClasePage]
})
export class AgregarClasePageModule {}
