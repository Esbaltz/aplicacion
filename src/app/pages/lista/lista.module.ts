import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ListaPageRoutingModule } from './lista-routing.module';

import { ListaPage } from './lista.page';

import { DatePipe } from '@angular/common';

import { QrCodeModule } from 'ng-qrcode';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DatePipe,
    ListaPageRoutingModule,
    QrCodeModule 
  ],
  declarations: [ListaPage]
})
export class ListaPageModule {}
