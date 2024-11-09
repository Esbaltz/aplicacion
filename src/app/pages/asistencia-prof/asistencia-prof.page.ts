import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Clases } from 'src/app/interfaces/iusuario';
import { FireStoreService } from 'src/app/services/firestore.service';
import { LocaldbService } from 'src/app/services/localdb.service';
import { sesionService } from 'src/app/services/sesion.service';

@Component({
  selector: 'app-asistencia-prof',
  templateUrl: './asistencia-prof.page.html',
  styleUrls: ['./asistencia-prof.page.scss'],
})
export class AsistenciaProfPage implements OnInit {
  cursos: Clases[] = [];
  userId : any
  constructor( private sesion : sesionService , private firestoreService : FireStoreService, private router: Router, private db: LocaldbService ) { 

    this.userId = this.sesion.getUser()?.id_usuario;
  }

  ngOnInit() {
    this.CargarCursos1()
  }
 
  CargarCursos1() {
    this.firestoreService.getCollectionChanges<{ id_docente: string, id_clase: string }>('Clases')
      .subscribe(ClasesIns => {
        if (ClasesIns) {
          console.log('ClasesIns =>',ClasesIns)

          const ClasesUsuario = ClasesIns.filter(c => c.id_docente === this.userId);
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


  ListaSesionXclase( clases : Clases){
    console.log('CURSO =>', clases)
    this.router.navigate(['/lista',clases.id_clase] );
    this.db.guardar(clases.id_clase , clases.id_docente)
    console.log('Se a guardado el curso con el ID =',clases.id_clase)

  }

}
