import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CredencialPageRoutingModule } from './credencial-routing.module';

import { CredencialPage } from './credencial.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CredencialPageRoutingModule
  ],
  declarations: [CredencialPage]
})
export class CredencialPageModule {}
