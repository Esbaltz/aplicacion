
import { Component, OnInit } from '@angular/core';
import { FireStoreService } from 'src/app/services/firestore.service';
import { sesionService } from 'src/app/services/sesion.service';
import { UserService } from 'src/app/services/usuarios.service';
import { Router } from '@angular/router';

// imports para el scanner
import { Barcode, BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { AlertController, ToastController  } from '@ionic/angular';
import { LocaldbService } from 'src/app/services/localdb.service';
import { Asistencia, Clases, Sesiones } from 'src/app/interfaces/iusuario';
import { firstValueFrom } from 'rxjs';


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
  scanHistory: { date: string ,data: string }[] = [];
  asistencias : Asistencia[] = []
  
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
    this.loadasistencia();
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
  
    const today = new Date().toISOString();  // Incluye fecha y hora
  
    for (const barcode of barcodes) {
      const data = barcode.displayValue || '';
      
      try {
        // Si solo tienes el id_sesion en el QR, puedes manejarlo de esta forma
        const qrData = { id_sesion: data };  // El QR solo contiene el id_sesion
  
        if (qrData.id_sesion) {
          // Aquí puedes usar el id_sesion para registrar la asistencia
          await this.registerAttendance(qrData.id_sesion, today);
  
          // Guarda el escaneo en el historial local
          this.scanHistory.push({ date: today, data });
          localStorage.setItem('scanHistory', JSON.stringify(this.scanHistory));
          this.db.guardar(qrData.id_sesion, this.scanHistory);
  
          this.router.navigate(['/asistencias']);
        } else {
          this.presentToast('Formato de QR inválido.');
        }
      } catch (error) {
        console.error('Error al interpretar el QR:', error);
        this.presentToast('Error al interpretar el QR.');
      }
    }
  }

  async registerAttendance(id_sesion: string, fecha_hora: string) {
    const alumnoId = this.sesion.getUser()?.id_usuario;
    if (!alumnoId) return;
  
    // Aquí deberías buscar la clase asociada a la sesión (esto depende de tu estructura)
    const clase = await this.getClaseBySesion(id_sesion);
    if (!clase) {
      this.presentToast('No se encontró la clase para esta sesión.');
      return;
    }
  
    // Registra la asistencia usando solo el id_sesion
    const asistenciaData = {
      estado: 'Presente',
      fecha_hora,
      id_alumno: alumnoId,
      id_asistencia: this.firestoreService.createIdDoc(), // genera un ID único para el registro
      id_clase: clase.id_clase,  // Asocia la clase obtenida
      id_sesion: id_sesion,
    };
  
    try {
      await this.firestoreService.guardarAsistencia(asistenciaData);
      this.presentToast('Asistencia registrada correctamente.');
    } catch (error) {
      console.error('Error al registrar asistencia:', error);
      this.presentToast('Error al registrar asistencia.');
    }
  }
  
  async getClaseBySesion(id_sesion: string) {
    try {
      // Paso 1: Busca la sesión usando `id_sesion` en `Sesiones`
      const sesionesSnapshot = await firstValueFrom(
        this.firestoreService.getCollectionChanges<Sesiones>('Sesiones')
      );
      const sesionData = sesionesSnapshot.find(s => s.id_sesion === id_sesion);
  
      if (!sesionData) {
        console.log('No se encontró la sesión con el id proporcionado.');
        return null;
      }
  
      // Paso 2: Obtén la clase usando `id_clase` de la sesión encontrada
      const clase = await firstValueFrom(
        this.firestoreService.getDocument<Clases>('Clases', sesionData.id_clase)
      );
  
      if (!clase) {
        console.log('No se encontró la clase asociada.');
        return null;
      }
  
      console.log('Clase encontrada:', clase);
      return clase;
    } catch (error) {
      console.error('Error al obtener la clase por sesión:', error);
      return null;
    }
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

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
    });
    await toast.present();
  }

  loadasistencia(){
    this.firestoreService.getCollectionChanges<Asistencia>('Asistencia').subscribe( data => {
      console.log(data);
      if (data) {
        this.asistencias = data
        console.log('Todas las asistencias => ',this.asistencias)
      }
    })
  }
}
