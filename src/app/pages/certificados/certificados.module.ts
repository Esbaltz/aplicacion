import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CertificadosPageRoutingModule } from './certificados-routing.module';

import { CertificadosPage } from './certificados.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CertificadosPageRoutingModule
  ],
  declarations: [CertificadosPage]
})
export class CertificadosPageModule {}
