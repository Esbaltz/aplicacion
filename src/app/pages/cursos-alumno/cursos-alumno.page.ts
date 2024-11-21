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
    this.CargarCursos()

  }

  CargarCursos(){
    this.firestoreService.getCollectionChanges<Clases>('Clases').subscribe( data => {
      console.log(data);
      if (data) {
        this.cursos = data
        
        console.log("Cursos Cargados")
         
      }
    })
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
