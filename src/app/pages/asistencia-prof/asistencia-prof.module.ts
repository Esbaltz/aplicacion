import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AsistenciaProfPageRoutingModule } from './asistencia-prof-routing.module';

import { AsistenciaProfPage } from './asistencia-prof.page';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AsistenciaProfPageRoutingModule,
  ],
  declarations: [AsistenciaProfPage]
})
export class AsistenciaProfPageModule {}
