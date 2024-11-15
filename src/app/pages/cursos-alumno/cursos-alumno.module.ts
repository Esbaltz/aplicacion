import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CursosAlumnoPageRoutingModule } from './cursos-alumno-routing.module';

import { CursosAlumnoPage } from './cursos-alumno.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CursosAlumnoPageRoutingModule
  ],
  declarations: [CursosAlumnoPage]
})
export class CursosAlumnoPageModule {}
