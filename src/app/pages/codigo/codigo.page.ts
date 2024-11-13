import { Component, OnInit } from '@angular/core';
import * as QRCode from 'qrcode';

@Component({
  selector: 'app-codigo',
  templateUrl: './codigo.page.html',
  styleUrls: ['./codigo.page.scss'],
})
export class CodigoPage implements OnInit {

  qrCodeDataUrl: string = '';

  constructor() { }

  ngOnInit() {
  }

  async generateQrCode(id_clase: string, id_sesion: string) {
    const qrData = JSON.stringify({ id_clase, id_sesion });
    
    // Generar el QR y guardarlo como Data URL
    this.qrCodeDataUrl = await QRCode.toDataURL(qrData);
  }

}
