
import { Component, OnInit } from '@angular/core';
import { FireStoreService } from 'src/app/services/firestore.service';
import { sesionService } from 'src/app/services/sesion.service';
import { UserService } from 'src/app/services/usuarios.service';
import { Router } from '@angular/router';

// imports para el scanner
import { Barcode, BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { AlertController, ToastController  } from '@ionic/angular';
import { LocaldbService } from 'src/app/services/localdb.service';


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
  scanHistory: { date: string, data: string }[] = [];
  
  // Esta funcion entreg alos datos del usuario logeado
  rol = this.sesion.getUser()?.rol;
  nombre = this.sesion.getUser()?.nombre;

  constructor( private toastController: ToastController, 
               private firestoreService : FireStoreService , 
               private sesion : sesionService , 
               private userService: UserService, 
               private router: Router, private alertController: AlertController ,
               private db:LocaldbService) {
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
  
    // Almacenar el escaneo con la fecha actual
    const today = new Date().toISOString().slice(0, 10); // Formato 'YYYY-MM-DD'
    for (const barcode of barcodes) {
      this.scanHistory.push({ date: today, data: barcode.displayValue || '' });
    }
  
    // Guardar en localStorage o enviar a Firestore según prefieras
    localStorage.setItem('scanHistory', JSON.stringify(this.scanHistory));
    this.db.guardar(this.scanHistory[0].data, this.scanHistory)
    this.router.navigate(['/asistencia'])
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
