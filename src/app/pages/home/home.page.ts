
import { Component, OnInit } from '@angular/core';
import { FireStoreService } from 'src/app/services/firestore.service';
import { sesionService } from 'src/app/services/sesion.service';
import { UserService } from 'src/app/services/usuarios.service';
import { Router } from '@angular/router';

// imports para el scanner
import { Barcode, BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  userName: string | null = null;
  userRole: string | null = null;

  // Variables para el scanner
  isSupported = false;
  barcodes: Barcode[] = [];
  
  // Esta funcion entreg alos datos del usuario logeado
  rol = this.sesion.getUser()?.rol;
  nombre = this.sesion.getUser()?.nombre;

  constructor( private firestoreService : FireStoreService , private sesion : sesionService , private userService: UserService, private router: Router, private alertController: AlertController) {
  }

  ngOnInit() {
    this.userRole = localStorage.getItem('rol');
    this.userName = localStorage.getItem('userName');

    BarcodeScanner.isSupported().then((result) => {
      this.isSupported = result.supported;
    });
  }

  async scan(): Promise<void> {
    const granted = await this.requestPermissions();
    if (!granted) {
      this.presentAlert();
      return;
    }
    const { barcodes } = await BarcodeScanner.scan();
    this.barcodes.push(...barcodes);
  }

  async requestPermissions(): Promise<boolean> {
    const { camera } = await BarcodeScanner.requestPermissions();
    return camera === 'granted' || camera === 'limited';
  }

  async presentAlert(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Permiso denegado',
      message: 'Para usar la aplicación autorizar los permisos de cámara',
      buttons: ['OK'],
    });
    await alert.present();
  }

  capitalize(name: string | null): string | null {
    if (!name) return null;
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  }
}
