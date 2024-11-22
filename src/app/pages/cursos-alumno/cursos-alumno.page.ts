import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Alumno, Clases } from 'src/app/interfaces/iusuario';
import { FireStoreService } from 'src/app/services/firestore.service';
import { LocaldbService } from 'src/app/services/localdb.service';
import { sesionService } from 'src/app/services/sesion.service';

@Component({
  selector: 'app-cursos-alumno',
  templateUrl: './cursos-alumno.page.html',
  styleUrls: ['./cursos-alumno.page.scss'],
})
export class CursosAlumnoPage implements OnInit {

  cursos : Clases[] = [];

  cursosAlumno : Clases[] = [];
  userId : any

  constructor( private sesion : sesionService , private firestoreService : FireStoreService , private db: LocaldbService , private route: ActivatedRoute,  private router: Router) { 

    this.userId = this.sesion.getUser()?.id_usuario;
  }

  ngOnInit() {
    this.CargarCursosAlumno()
  }

  CargarCursos(){
    this.firestoreService.getCollectionChanges<Clases>('Clases').subscribe( data => {
      //console.log(data);
      if (data) {
        this.cursos = data
        console.log("Todos los cursos =>",data)
         
      }
    })
  }

  CargarCursosAlumno() {
    this.firestoreService.getCollectionChanges<{ alumnos: Alumno[], id_clase: string }>('Clases')
      .subscribe(ClasesIns => {
        if (ClasesIns) {
          // Filtrar clases en las que el alumno (con userId) esté presente en el array de alumnos
          const ClasesUsuario = ClasesIns.filter(c => c.alumnos.some(alumno => alumno === this.userId));
  
          // Obtener los ids de las clases en las que el alumno está inscrito
          const ClasesIds = ClasesUsuario.map(c => c.id_clase);
  
          // Obtener las clases completas desde Firestore que coinciden con los ids
          this.firestoreService.getCollectionChanges<Clases>('Clases').subscribe(data => {
            if (data) {
              // Filtrar los cursos que están en la lista de clases del alumno
              this.cursos = data.filter(curso => ClasesIds.includes(curso.id_clase));
              console.log("Cursos del alumno =>",this.cursos);
            }
          });
        }
      });
  }

  DetalleCurso ( clases : Clases )  {

    if ( clases === null) {
      console.log('Id clase no encontrado')
    }else {
      console.log('CURSO =>', clases)
      this.router.navigate(['/detalle-clase',clases.id_clase] );
      this.db.guardar(clases.id_clase , clases)
      console.log('Se a guardado el curso con el ID =',clases.id_clase)
    }
  }
 
}
