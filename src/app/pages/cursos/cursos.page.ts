import { Component, OnInit } from '@angular/core';
import { Clases } from 'src/app/interfaces/iusuario';
import { FireStoreService } from 'src/app/services/firestore.service';
import { sesionService } from 'src/app/services/sesion.service';
import { Usuario } from '../../interfaces/iusuario';

@Component({
  selector: 'app-cursos',
  templateUrl: './cursos.page.html',
  styleUrls: ['./cursos.page.scss'],
})
export class CursosPage implements OnInit {
  selectedSegment: string = 'inscritos';

  cursos : Clases[] = [];
  userId : any

  constructor( private sesion : sesionService , private firestoreService : FireStoreService) { 

    this.userId = this.sesion.getUser()?.id_usuario;
  }

  ngOnInit() {
    this.CargarCursos1();
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
  

}
