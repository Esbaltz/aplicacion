import { Component, OnInit } from '@angular/core';
import { Asistencia,Sesiones ,Clases, Usuario } from 'src/app/interfaces/iusuario';
import { FireStoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-prueba',
  templateUrl: './prueba.page.html',
  styleUrls: ['./prueba.page.scss'],
})
export class PruebaPage implements OnInit {

  users : Usuario[] = [];
  clase : Clases[] = [];
  sesion : Sesiones[] = [];
  asistencia : Asistencia[] = [];

  constructor( private firestoreService : FireStoreService ) { 
    this.loadusers();
    this.loadclases();
    this.loadsesiones();
    this.loadasistencia();
  }

  ngOnInit() {
  }

  loadusers(){
    this.firestoreService.getCollectionChanges<Usuario>('Usuarios').subscribe( data => {
      console.log(data);
      if (data) {
        this.users = data

      }
    })
  }
  loadclases(){
    this.firestoreService.getCollectionChanges<Clases>('Clases').subscribe( data => {
      console.log(data);
      if (data) {
        this.clase = data

      }
    })
  }
  loadsesiones(){
    this.firestoreService.getCollectionChanges<Sesiones>('Sesiones').subscribe( data => {
      console.log(data);
      if (data) {
        this.sesion = data

      }
    })
  }

  loadasistencia(){
    this.firestoreService.getCollectionChanges<Asistencia>('Asistencia').subscribe( data => {
      console.log(data);
      if (data) {
        this.asistencia = data

      }
    })
  }


}

