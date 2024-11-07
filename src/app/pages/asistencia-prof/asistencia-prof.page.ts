import { Component, OnInit } from '@angular/core';
import { Clases } from 'src/app/interfaces/iusuario';
import { FireStoreService } from 'src/app/services/firestore.service';
import { sesionService } from 'src/app/services/sesion.service';

@Component({
  selector: 'app-asistencia-prof',
  templateUrl: './asistencia-prof.page.html',
  styleUrls: ['./asistencia-prof.page.scss'],
})
export class AsistenciaProfPage implements OnInit {
  curso: Clases[] = [];

  constructor( private sesion : sesionService , private firestoreService : FireStoreService) { }

  ngOnInit() {
    this.CargarCursos()
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
