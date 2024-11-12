import { Component, OnInit } from '@angular/core';
import { Asistencia, Clases, Sesiones } from 'src/app/interfaces/iusuario';
import { FireStoreService } from 'src/app/services/firestore.service';
import { sesionService } from 'src/app/services/sesion.service';

@Component({
  selector: 'app-asistencias',
  templateUrl: './asistencias.page.html',
  styleUrls: ['./asistencias.page.scss'],
})
export class AsistenciasPage implements OnInit {
  cursos: Clases[] = [];
  userId : any
  asistencias : Asistencia[] = [];
  sesiones : Sesiones[] = [];
  Asistencia_Actualizada : Asistencia = {
    id_alumno : this.sesion.getUser()?.id_usuario,
    id_clase : '',
    id_sesion: '',
    id_asistencia :'',
    estado : '',
    fecha_hora : new Date()
  }

  scanHistory: { date : Date[] , SesionScaneda: string }[] = []; 
  EstadoNuevo = 'Presente'
  constructor(private sesion : sesionService , private firestoreService : FireStoreService ,) { 

    this.userId = this.sesion.getUser()?.id_usuario;
  }

  ngOnInit(
  ) {
    this.CargarCursos1()
    console.log('USUARIO ID =>',this.userId)
    this.loadasistencia()
    const storedHistory = localStorage.getItem('scanHistory');
    this.scanHistory = storedHistory ? JSON.parse(storedHistory) : [];
  }

  ScaneoQr ( id_sesion : string , fecha : Date) {
                  // Logica Italo
    //const FechaXhoraNueva = this.scanHistory[0]?.date[0];
    //this.asistencias.forEach( asistencia => {
    //  if ( asistencia.id_sesion === this.scanHistory.filter( c => c.SesionScaneda) || asistencia.id_alumno === this.sesion.getUser()?.id_usuario){
    //    
    //    this.firestoreService.updateAsistenciaAlumno('Asistencia',asistencia.id_asistencia , this.EstadoNuevo , FechaXhoraNueva);
    //    console.log(asistencia.id_asistencia , '==> Esta Asistencia a sido actualizada')
    //  } else {
    //  console.log("Alumno sin scanear el QR todavia")
    //}
    //});
  
   fecha = this.scanHistory[0]?.date[0];
   const userId = this.sesion.getUser()?.id_usuario;
   id_sesion = this.scanHistory[0]?.SesionScaneda[0]

   this.asistencias.forEach(asistencia => {

      if (id_sesion === asistencia.id_sesion && asistencia.id_alumno === userId) {
        this.firestoreService.updateAsistenciaAlumno('Asistencia', asistencia.id_asistencia, this.EstadoNuevo, fecha);
        console.log(`${asistencia.id_asistencia} ==> Esta Asistencia ha sido actualizada`);
      } else {
        console.log("Alumno sin scanear el QR todavía");
      }
});

  }

  CargarCursos(){
    this.firestoreService.getCollectionChanges<Clases>('Clases').subscribe( data => {
      console.log(data);
      if (data) {
        this.cursos = data
      }
    })
  }

  loadasistencia(){
    this.firestoreService.getCollectionChanges<Asistencia>('Asistencia').subscribe( data => {
      console.log(data);
      if (data) {
        this.asistencias = data

      }
    })
  }

  loadsesiones(){
    this.firestoreService.getCollectionChanges<Sesiones>('Sesiones').subscribe( data => {
      console.log(data);
      if (data) {
        this.sesiones = data

      }
    })
  }

  CargarCursos1() {
    this.firestoreService.getCollectionChanges<{ id_alumno: string, id_clase: string }>('Clases')
      .subscribe(ClasesIns => {
        if (ClasesIns) {
          console.log('ClasesIns =>',ClasesIns)

          const ClasesUsuario = ClasesIns.filter(c => c.id_alumno === this.userId);
          console.log('ClasesUsuario', ClasesUsuario)

          const ClasesIds = ClasesUsuario.map(c => c.id_clase);
          console.log('ClasesIds =>',ClasesIds)

          this.firestoreService.getCollectionChanges<Clases>('Clases').subscribe(data => {
            if (data) {
              console.log(data)
              this.cursos = data.filter(curso => ClasesIds.includes(curso.id_clase));
              console.log(this.cursos)
            }
          })
        }
      });
  }
}
