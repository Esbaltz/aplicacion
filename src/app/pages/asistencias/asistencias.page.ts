import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { Alumno, Asistencia, Clases, Sesiones } from 'src/app/interfaces/iusuario';
import { FireStoreService } from 'src/app/services/firestore.service';
import { LocaldbService } from 'src/app/services/localdb.service';
import { sesionService } from 'src/app/services/sesion.service';
import { DatePipe } from '@angular/common';
import { NetworkService } from 'src/app/services/network.service';

@Component({
  selector: 'app-asistencias',
  templateUrl: './asistencias.page.html',
  styleUrls: ['./asistencias.page.scss'],
  providers: [DatePipe]
})
export class AsistenciasPage implements OnInit {
  cursosAlumno: Clases[] = [];
  usuarioId : any
  asistencias : Asistencia[] = [];
  sesiones : Sesiones[] = [];

  constructor(private datePipe: DatePipe,
    private sesion : sesionService , 
    private firestoreService : FireStoreService , 
    private db:LocaldbService , 
    private alertctrl:AlertController , 
    private toastController:ToastController,
    private networkService: NetworkService) { 

    this.usuarioId = this.sesion.getUser()?.id_usuario;
  }

  ngOnInit() {
    if (this.networkService.isConnected()) { 
      this.CargarCursosAlumno()
      console.log('USUARIO ID =>',this.usuarioId)
      this.loadasistencia()
      console.log('Tienes conexión a Internet.');
    }
    else{
      this.CargarCursosDeLocal();
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
              this.db.guardar(this.usuarioId, this.cursosAlumno)
            }
          });
        }
      });
  }

  // Falta filtrarlas bien
  loadasistencia(){
    this.firestoreService.getCollectionChanges<Asistencia>('Asistencia').subscribe( data => {
      //console.log(data);
      if (data) {
        this.asistencias = data
        console.log("Asistencias del alumno => ",this.asistencias)
      }
    })
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

}
