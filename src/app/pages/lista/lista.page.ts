import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Clases, Sesiones } from 'src/app/interfaces/iusuario';
import { FireStoreService } from 'src/app/services/firestore.service';
import { sesionService } from 'src/app/services/sesion.service';
import { user } from '@angular/fire/auth';
import { LocaldbService } from 'src/app/services/localdb.service';

@Component({
  selector: 'app-lista',
  templateUrl: './lista.page.html',
  styleUrls: ['./lista.page.scss'],
})
export class ListaPage implements OnInit {

  cursos : Clases[] = [];
  CursoCargado: Clases = {
    id_alumno : '',
    id_docente : '',
    id_clase : '',
    nomb_clase : '',
    semestre : 0,
    estado : ''

  };
  IdClase : any
  sesiones : Sesiones[] = [];
  userId : any

  constructor( private firestoreService : FireStoreService , private sesion : sesionService , private route: ActivatedRoute , private db: LocaldbService ) {
    this.userId = this.sesion.getUser()?.id_usuario; 
  }

  ngOnInit( ) {
    this.CargarCursos();
    const ClaseId = this.route.snapshot.paramMap.get('id');
    if (ClaseId) {
      this.cargarCurso(ClaseId);
    }
    this.CargarSesiones()
  }

  cargarCurso(id_clase: string) {
    this.firestoreService.getDocument<Clases>('Clases', id_clase).subscribe(curso => {
      if (curso) {
        this.CursoCargado = curso;
        console.log('Curso cargado:', this.CursoCargado); 
        this.IdClase = this.CursoCargado.id_clase
      }
    });
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

  CargarSesiones(){
    this.firestoreService.getCollectionChanges<{ id_clase : string,id_sesion: string  }>('Sesiones')
      .subscribe(SesionesIns => {
        if (SesionesIns) {
          console.log('SesionesIns =>',SesionesIns) // Muestra todas
          console.log('Id-clase : ',this.IdClase)
          const SesionesCurso = SesionesIns.filter(s => s.id_clase == this.IdClase );
          console.log('SesionesCurso', SesionesCurso)

          const SesionIds = SesionesCurso.map(s => s.id_sesion);
          console.log('SesionIds =>',SesionIds)

          this.firestoreService.getCollectionChanges<Sesiones>('Sesiones').subscribe(data => {
            if (data) {
              console.log(data)
              this.sesiones = data.filter(sesion => SesionIds.includes(sesion.id_sesion));
              console.log(this.sesion)
            }
          })
        }
      });
  }

}
