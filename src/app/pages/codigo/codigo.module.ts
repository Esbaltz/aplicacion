import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QrCodeModule } from 'ng-qrcode';

import { IonicModule } from '@ionic/angular';

import { CodigoPageRoutingModule } from './codigo-routing.module';

import { CodigoPage } from './codigo.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CodigoPageRoutingModule,
    QrCodeModule,
  ],
  declarations: [CodigoPage]
})
export class CodigoPageModule {}
