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
  asistenciasAlumno : Asistencia[] = [];
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

  async ngOnInit() {
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

}
