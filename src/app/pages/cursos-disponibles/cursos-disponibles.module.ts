import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CursosDisponiblesPageRoutingModule } from './cursos-disponibles-routing.module';

import { CursosDisponiblesPage } from './cursos-disponibles.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CursosDisponiblesPageRoutingModule
  ],
  declarations: [CursosDisponiblesPage]
})
export class CursosDisponiblesPageModule {}
