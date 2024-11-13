import { Component, OnInit } from '@angular/core';
import { FireStoreService } from 'src/app/services/firestore.service';
import { sesionService } from 'src/app/services/sesion.service';
import { UserService } from 'src/app/services/usuarios.service';
import { Router } from '@angular/router';
import { Barcode, BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { AlertController, ToastController } from '@ionic/angular';
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

  rol = this.sesion.getUser()?.rol;
  nombre = this.sesion.getUser()?.nombre;

  constructor(
    private toastController: ToastController, 
    private firestoreService: FireStoreService, 
    private sesion: sesionService, 
    private userService: UserService, 
    private router: Router, 
    private alertController: AlertController,
    private db: LocaldbService
  ) {}

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

    const today = new Date().toISOString();  // Incluye fecha y hora

    for (const barcode of barcodes) {
      const data = barcode.displayValue || '';

      try {
        const qrData = JSON.parse(data);
        
        if (qrData.id_clase && qrData.id_sesion) {
          // Registra la asistencia en Firestore
          await this.registerAttendance(qrData.id_clase, qrData.id_sesion, today);

          // Guarda el escaneo en el historial local
          this.scanHistory.push({ date: today, data });
          localStorage.setItem('scanHistory', JSON.stringify(this.scanHistory));
          this.db.guardar(qrData.id_clase, this.scanHistory);

          this.router.navigate(['/asistencia']);
        } else {
          this.presentToast('Formato de QR inválido.');
        }
      } catch (error) {
        console.error('Error al interpretar el QR:', error);
        this.presentToast('Error al interpretar el QR.');
      }
    }
  }

  async registerAttendance(id_clase: string, id_sesion: string, fecha_hora: string) {
    const alumnoId = this.sesion.getUser()?.id_usuario;
    if (!alumnoId) return;
  
    // Verifica si ya existe un registro de asistencia para este alumno en esta clase y sesión
    const attendanceDoc = await this.firestoreService.getAttendanceRecord(id_clase, id_sesion, alumnoId);
    if (attendanceDoc) {
      this.presentToast('Ya has registrado tu asistencia para esta sesión.');
      return; // No registra si ya existe
    }
  
    const asistenciaData = {
      estado: 'presente',
      fecha_hora,
      id_alumno: alumnoId,
      id_asistencia: this.firestoreService.generateId(), // genera un ID único para el registro
      id_clase,
      id_sesion
    };
  
    try {
      await this.firestoreService.guardarAsistencia(asistenciaData);
      this.presentToast('Asistencia registrada correctamente.');
    } catch (error) {
      console.error('Error al registrar asistencia:', error);
      this.presentToast('Error al registrar asistencia.');
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

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
    });
    await toast.present();
  }

  capitalize(name: string | null): string | null {
    if (!name) return null;
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  }
}
