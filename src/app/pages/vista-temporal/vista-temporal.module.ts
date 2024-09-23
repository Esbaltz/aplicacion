import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VistaTemporalPageRoutingModule } from './vista-temporal-routing.module';

import { VistaTemporalPage } from './vista-temporal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VistaTemporalPageRoutingModule
  ],
  declarations: [VistaTemporalPage]
})
export class VistaTemporalPageModule {}
