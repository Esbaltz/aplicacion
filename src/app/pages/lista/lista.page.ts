import { Component, OnInit } from '@angular/core';
import { Clases, Sesiones } from 'src/app/interfaces/iusuario';
import { FireStoreService } from 'src/app/services/firestore.service';
import { sesionService } from 'src/app/services/sesion.service';

@Component({
  selector: 'app-lista',
  templateUrl: './lista.page.html',
  styleUrls: ['./lista.page.scss'],
})
export class ListaPage implements OnInit {

  cursos : Clases[] = [];
  clases : Sesiones[] = [];

  userId : any
  claseId : any

  constructor( private firestoreService : FireStoreService , private sesion : sesionService , ) {
    this.userId = this.sesion.getUser()?.id_usuario; 
    this.claseId = this.sesion.getClase()?.id_clase
  }

  ngOnInit() {
    this.CargarSesiones();
  }

  CargarSesiones() {
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
              
              console.log('-------------------------------------------------------------------')

              this.firestoreService.getCollectionChanges<{ id_clase: string, id_sesion: string }>('Sesiones')
                .subscribe(ClasesIns => {
                  if (ClasesIns) {
                    console.log('ClasesIns =>',ClasesIns)
                    const ClasesCurso = ClasesIns.filter(s => s.id_clase === this.claseId);
                    console.log('ClasesCurso', ClasesCurso)

                    const SesionIds = ClasesCurso.map(s => s.id_sesion);
                    console.log('SesionIds =>',SesionIds)

                    this.firestoreService.getCollectionChanges<Sesiones>('Sesiones').subscribe(data => {
                      if (data) {
                        console.log(data)
                        this.clases = data.filter(clase => SesionIds.includes(clase.id_sesion));
                        console.log(this.clases)
                      }
                    })
                  }
                });
            }
          })
        }
      });
  }

}
