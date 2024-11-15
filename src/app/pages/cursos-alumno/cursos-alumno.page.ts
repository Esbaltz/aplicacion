import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Clases } from 'src/app/interfaces/iusuario';
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
  userId : any

  constructor( private sesion : sesionService , private firestoreService : FireStoreService , private db: LocaldbService , private route: ActivatedRoute,  private router: Router) { 

    this.userId = this.sesion.getUser()?.id_usuario;
  }

  ngOnInit() {
    this.CargarCursos1()
  }

  CargarCursos1() {
    this.firestoreService.getCollectionChanges<{ id_alumno: string, id_clase: string }>('Clases')
      .subscribe(ClasesIns => {
        if (ClasesIns) {
          console.log('ClasesIns =>',ClasesIns)

          const ClasesUsuario = ClasesIns.filter(c => c.id_alumno === this.userId );
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
