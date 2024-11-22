import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { Alumno, Asistencia, Clases, Sesiones } from 'src/app/interfaces/iusuario';
import { FireStoreService } from 'src/app/services/firestore.service';
import { LocaldbService } from 'src/app/services/localdb.service';
import { sesionService } from 'src/app/services/sesion.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-asistencias',
  templateUrl: './asistencias.page.html',
  styleUrls: ['./asistencias.page.scss'],
  providers: [DatePipe]
})
export class AsistenciasPage implements OnInit {
  cursos: Clases[] = [];
  usuarioId : any
  asistencias : Asistencia[] = [];
  sesiones : Sesiones[] = [];

  constructor(private datePipe: DatePipe,private sesion : sesionService , private firestoreService : FireStoreService , private db:LocaldbService , private alertctrl:AlertController , private toastController:ToastController) { 

    this.usuarioId = this.sesion.getUser()?.id_usuario;
  }

  ngOnInit(
  ) {
    this.CargarCursosAlumno()
    console.log('USUARIO ID =>',this.usuarioId)
    this.loadasistencia()
    
  }
  formatFechaHora(timestamp: any): string {
    if (timestamp && timestamp.seconds) {
      // Convertir el Timestamp de Firebase a un objeto Date
      const date = new Date(timestamp.seconds * 1000); // Convertir de segundos a milisegundos
      return this.datePipe.transform(date, 'dd/MM/yyyy HH:mm')!;
    }
    return ''; // Si no hay un Timestamp válido, devolver una cadena vacía
  }

  CargarCursosAlumno() {
    this.firestoreService.getCollectionChanges<{ alumnos: Alumno[], id_clase: string }>('Clases')
      .subscribe(ClasesIns => {
        if (ClasesIns) {
          // Filtrar clases en las que el alumno (con userId) esté presente en el array de alumnos
          const ClasesUsuario = ClasesIns.filter(c => c.alumnos.some(alumno => alumno === this.usuarioId));
  
          // Obtener los ids de las clases en las que el alumno está inscrito
          const ClasesIds = ClasesUsuario.map(c => c.id_clase);
  
          // Obtener las clases completas desde Firestore que coinciden con los ids
          this.firestoreService.getCollectionChanges<Clases>('Clases').subscribe(data => {
            if (data) {
              // Filtrar los cursos que están en la lista de clases del alumno
              this.cursos = data.filter(curso => ClasesIds.includes(curso.id_clase));
              console.log("Cursos del alumno =>",this.cursos);
              this.db.guardar(this.usuarioId, this.cursos)
            }
          });
        }
      });
  }

  loadasistencia(){
    this.firestoreService.getCollectionChanges<Asistencia>('Asistencia').subscribe( data => {
      //console.log(data);
      if (data) {
        this.asistencias = data
        console.log("Asistencias del alumno => ",this.asistencias)
      }
    })
  }

  loadsesiones(){
    this.firestoreService.getCollectionChanges<Sesiones>('Sesiones').subscribe( data => {
      //console.log(data);
      if (data) {
        this.sesiones = data
      }
    })
  }


}
