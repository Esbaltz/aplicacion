import { Component, OnInit } from '@angular/core';
import { Asistencia, Clases } from 'src/app/interfaces/iusuario';
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

  constructor(private sesion : sesionService , private firestoreService : FireStoreService) { 

    this.userId = this.sesion.getUser()?.id_usuario;
  }

  ngOnInit(
  ) {
    this.CargarCursos1()
    console.log('USUARIO ID =>',this.userId)
    this.loadasistencia()
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
