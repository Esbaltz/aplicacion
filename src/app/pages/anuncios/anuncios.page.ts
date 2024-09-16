import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-anuncios',
  templateUrl: './anuncios.page.html',
  styleUrls: ['./anuncios.page.scss'],
})
export class AnunciosPage implements OnInit {

  constructor(private alertController: AlertController) {  }

  async presentAlert() {
    const alert = await this.alertController.create({
      header: 'Anuncio Importante',
      subHeader: 'A Sub Header Is Optional',
      message: 'A message should be a short, complete sentence.',
      buttons: ['Aceptar'],
    });

    await alert.present();
  }
  ngOnInit() {
  }

}
