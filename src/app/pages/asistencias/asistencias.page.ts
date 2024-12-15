import { Component, OnInit, inject } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { Alumno, Asistencia, Clases, Sesiones } from 'src/app/interfaces/iusuario';
import { FireStoreService } from 'src/app/services/firestore.service';
import { LocaldbService } from 'src/app/services/localdb.service';
import { sesionService } from 'src/app/services/sesion.service';
import { DatePipe } from '@angular/common';
import { NetworkService } from 'src/app/services/network.service';
import { Barcode, BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { Firestore, collection, getDocs, query, where } from '@angular/fire/firestore';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-asistencias',
  templateUrl: './asistencias.page.html',
  styleUrls: ['./asistencias.page.scss'],
  providers: [DatePipe]
})
export class AsistenciasPage implements OnInit {

  userName: string | null = null;
  userRole: string | null = null; 

  cursosAlumno: Clases[] = [];
  usuarioId : any
  asistenciasAlumno : Asistencia[] = [];
  sesiones : Sesiones[] = [];

  isSupported = false;
  barcodes: Barcode[] = [];
  scanHistory: { date: string ,data: string }[] = [];
  asistencias : Asistencia[] = []
  firestore: Firestore = inject(Firestore);

  constructor(private datePipe: DatePipe,
    private sesion : sesionService , 
    private firestoreService : FireStoreService , 
    private db:LocaldbService , 
    private alertctrl:AlertController , 
    private toastController:ToastController,
    private networkService: NetworkService,
    private alertController: AlertController ,
    private router: Router,
  ) { 

    this.usuarioId = this.sesion.getUser()?.id_usuario;
  }

  async ngOnInit() {
    this.userRole = localStorage.getItem('rol');
    this.userName = localStorage.getItem('userName');
    this.loadasistencia();
    BarcodeScanner.isSupported().then((result) => {
      this.isSupported = result.supported;
    });

    if (this.networkService.isConnected()) { 
      this.CargarCursosAlumno()
      this.loadasistencia()
      console.log('Tienes conexión a Internet.');

      if (this.asistenciasAlumno.length > 1) {
        await this.GuardarAsistenciasLocal(this.asistenciasAlumno); // Guardar cursos si existen
      } else {
        console.log('No hay asistencia para guardar');
      }
    }
    else{
      console.log('No tienes conexion')
      this.CargarCursosDeLocal();
      await this.CargarAsistenciasDeLocal();
    }
  }

  formatFechaHora(timestamp: any): string {
    if (timestamp && timestamp.seconds) {
      const date = new Date(timestamp.seconds * 1000); 
      return this.datePipe.transform(date, 'dd/MM/yyyy HH:mm')!;
    }
    return ''; 
  }

  CargarCursosAlumno() {
    this.firestoreService.getCollectionChanges<{ alumnos: Alumno[], id_clase: string }>('Clases')
      .subscribe(ClasesIns => {
        if (ClasesIns) {
          const ClasesUsuario = ClasesIns.filter(c => c.alumnos.some(alumno => alumno === this.usuarioId));
          const ClasesIds = ClasesUsuario.map(c => c.id_clase);
          this.firestoreService.getCollectionChanges<Clases>('Clases').subscribe(data => {
            if (data) {
              this.cursosAlumno = data.filter(curso => ClasesIds.includes(curso.id_clase));
              console.log("Cursos del alumno =>",this.cursosAlumno);
            }
          });
        }
      });
  }

  loadasistencia() {
    this.firestoreService.getCollectionChanges<{ id_alumno: string; fecha_hora: any; id_sesion: string; id_clase: string; estado: string; id_asistencia: string }>('Asistencia')
      .subscribe(AsistenciasIns => {
        if (AsistenciasIns) {
          const AsistenciaAlumno = AsistenciasIns.filter(a => a.id_alumno === this.usuarioId)
            .map(a => {
              return {
                id_alumno: a.id_alumno,
                fecha_hora: a.fecha_hora, 
                id_sesion: a.id_sesion,
                id_clase: a.id_clase,
                estado: a.estado,
                id_asistencia: a.id_asistencia,
              };
            });
          
          this.asistenciasAlumno = AsistenciaAlumno;
          console.log('Asistencias del alumno => ', this.asistenciasAlumno);

          if (this.asistenciasAlumno.length > 1) {
            this.GuardarAsistenciasLocal(this.asistenciasAlumno);
          } else {
            console.log('No hay asistencias para guardar');
          }
        }
      });
  }

  async GuardarAsistenciasLocal(asistenciaAlumno: Asistencia[]) {
    try {
      // Guardar los cursos en localStorage
      localStorage.setItem('asistenciaAlumno', JSON.stringify(asistenciaAlumno));
      this.db.guardar('asistenciaAlumno',asistenciaAlumno)
      console.log('Asistencias guardadas en el local');
    } catch (error) {
      console.error('Error guardando las asistencias en local:', error);
    }
  }

  async CargarAsistenciasDeLocal() {
    // Intenta cargar los asistencias de Localdb primero
    const asistenciaGuardadas = await this.db.obtener('asistenciaAlumno');
    console.log('Asistencias guardadas desde Localdb:', asistenciaGuardadas);
    if (asistenciaGuardadas) {
      this.asistenciasAlumno = asistenciaGuardadas;
    } else {
      // Si no se encontraron, intenta cargar desde localStorage
      const asistenciasDesdeStorage = JSON.parse(localStorage.getItem('asistenciaAlumno') || '[]');
      console.log('Asistencias guardadas desde el localStorage:', asistenciasDesdeStorage);
      this.asistenciasAlumno = asistenciasDesdeStorage;
    }
  }

  async CargarCursosDeLocal() {
    // Intenta cargar los cursos de Localdb primero
    const cursosGuardados = await this.db.obtener('cursosAlumno');
    console.log('Cursos guardados desde Localdb:', cursosGuardados);
    if (cursosGuardados) {
      this.cursosAlumno = cursosGuardados;
    } else {
      // Si no se encontraron, intenta cargar desde localStorage
      const cursosDesdeStorage = JSON.parse(localStorage.getItem('cursosAlumno') || '[]');
      console.log('Cursos guardados desde localStorage:', cursosDesdeStorage);
      this.cursosAlumno = cursosDesdeStorage;
    }
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
  
          this.router.navigate(['/tabs/asistencias']);
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
  
    loadasistencia2(){
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
