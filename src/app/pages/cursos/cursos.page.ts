import { Component, OnInit } from '@angular/core';
import { Clases } from 'src/app/interfaces/iusuario';
import { FireStoreService } from 'src/app/services/firestore.service';
import { sesionService } from 'src/app/services/sesion.service';

@Component({
  selector: 'app-cursos',
  templateUrl: './cursos.page.html',
  styleUrls: ['./cursos.page.scss'],
})
export class CursosPage implements OnInit {
  selectedSegment: string = 'inscritos';
  curso : Clases[] = [];
  id = this.sesion.getUser()?.id_usuario;

  constructor( private sesion : sesionService , private firestoreService : FireStoreService) { 

    this.CargarCursos();
  }

  ngOnInit() {
  }

  CargarCursos(){
    this.firestoreService.getCollectionChanges<Clases>('Clases').subscribe( data => {
      console.log(data);
      if (data) {
        this.curso = data
      }
    })
  }
  

}
