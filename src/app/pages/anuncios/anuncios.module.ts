import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AnunciosPageRoutingModule } from './anuncios-routing.module';

import { AnunciosPage } from './anuncios.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AnunciosPageRoutingModule
  ],
  declarations: [AnunciosPage]
})
export class AnunciosPageModule {}
