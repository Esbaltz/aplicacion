
import { Component, OnInit, inject } from '@angular/core';
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
import { Firestore, collection, getDocs, query, where } from '@angular/fire/firestore';


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
  firestore: Firestore = inject(Firestore);
  
  // Esta funcion entreg alos datos del usuario logeado
  rol = this.sesion.getUser()?.rol;
  nombre = this.sesion.getUser()?.nombre;

  UserId : any

  constructor( private toastController: ToastController, 
               private firestoreService : FireStoreService , 
               private sesion : sesionService , 
               private userService: UserService, 
               private router: Router, private alertController: AlertController ,
               private db:LocaldbService,
               ) {

                

  }

  ngOnInit() {
    this.userRole = localStorage.getItem('rol');
    this.userName = localStorage.getItem('userName');
    this.loadasistencia();
    BarcodeScanner.isSupported().then((result) => {
      this.isSupported = result.supported;
    });

    this.UserId = this.sesion.getUser()?.id_usuario

    
  }

  checkNetworkConnection() {
    // Cada vez que la red se restablezca, verificamos si hay escaneos pendientes
    window.addEventListener('online', () => {
      this.syncLocalDataWithFirebase();  // Sincronizamos cuando se reconecte
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
      const data = barcode.displayValue || '';  // Captura el valor del código QR
      console.log('QR escaneado:', data);  // Verifica que se esté capturando el valor del QR
  
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
  
    // Obtén la asistencia existente (si la hay) usando el método anterior
    const asistenciaExistente = await this.getAsistenciaBySesionAndAlumno(id_sesion, alumnoId);
  
    if (asistenciaExistente) {
      // Si la asistencia existe, actualízala
      await this.firestoreService.updateAsistenciaAlumno(
        'Asistencia',
        asistenciaExistente.id,
        'Presente',
        new Date(fecha_hora)
      );
      this.presentToast('Asistencia actualizada correctamente.');
    } else {
      // Si la asistencia no existe, crea un nuevo registro
      const clase = await this.getClaseBySesion(id_sesion);
      if (!clase) {
        this.presentToast('No se encontró la clase para esta sesión. o no tienes conexion');
        return;
      }
  
      const asistenciaData = {
        estado: 'Presente',
        fecha_hora,
        id_alumno: alumnoId,
        id_asistencia: this.firestoreService.createIdDoc(),
        id_clase: clase.id_clase,
        id_sesion: id_sesion,
      };
  
      await this.firestoreService.guardarAsistencia(asistenciaData);
      this.QRescaneado('top');
    }
  }

  async saveOfflineData(id_sesion: string, fecha_hora: string) {
    // Guardamos la asistencia escaneada de forma local para cuando haya conexión
    const offlineData = await this.db.obtener('offlineAsistencias') || [];
    offlineData.push({ id_sesion, fecha_hora });
    await this.db.guardar('offlineAsistencias', offlineData);
    this.presentToast('No hay conexión. Los datos se guardaron localmente.');
  }

  async syncLocalDataWithFirebase() {
    // Comprobamos si hay datos guardados localmente que necesitan sincronizarse
    const offlineData = await this.db.obtener('offlineAsistencias');
    if (offlineData && offlineData.length > 0) {
      for (let data of offlineData) {
        const { id_sesion, fecha_hora } = data;
        try {
          await this.registerAttendance(id_sesion, fecha_hora);
        } catch (error) {
          console.error('Error al sincronizar la asistencia:', error);
        }
      }
      // Una vez sincronizados, limpiamos los datos locales
      await this.db.guardar('offlineAsistencias', []);
      this.presentToast('Datos sincronizados con éxito.');
    }
  }
  
  async getAsistenciaBySesionAndAlumno(id_sesion: string, id_alumno: string) {
    try {
      // Crea una referencia a la colección "Asistencia"
      const attendanceCollection = collection(this.firestore, 'Asistencia');
      
      // Crea una consulta que filtre por id_sesion y id_alumno
      const q = query(
        attendanceCollection,
        where('id_sesion', '==', id_sesion),
        where('id_alumno', '==', id_alumno)
      );
  
      // Ejecuta la consulta y espera los resultados
      const querySnapshot = await getDocs(q);
  
      if (querySnapshot.empty) {
        console.log('No se encontró asistencia para esta sesión y alumno.');
        return null;  // No se encontró ningún documento
      }
  
      // Si se encuentra un documento, devuelve el primer resultado
      const asistenciaDoc = querySnapshot.docs[0];
      console.log('Asistencia encontrada:', asistenciaDoc.data());
      
      // Devuelve el ID de la asistencia
      return {
        id: asistenciaDoc.id,
        ...asistenciaDoc.data(),
      };
    } catch (error) {
      console.error('Error al obtener la asistencia:', error);
      return null;  // Si ocurre algún error, devuelve null
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
      position: 'top',
      color : 'success'
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

  async QRescaneado(position: 'top' | 'middle' | 'bottom') {
    const toast = await this.toastController.create({
      message: `QR escaneado correctamente asistencia actualizada`,
      duration: 1500,
      position: position,
      color: 'success',
      header: 'Aviso!',
      cssClass: 'textoast',
    });

    await toast.present();
  }

 
}
