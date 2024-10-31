import { Component, OnInit } from '@angular/core';
import { Usuario } from 'src/app/interfaces/iusuario';
import { FireStoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-prueba',
  templateUrl: './prueba.page.html',
  styleUrls: ['./prueba.page.scss'],
})
export class PruebaPage implements OnInit {

  users : Usuario[] = [];

  constructor( private firestoreService : FireStoreService ) { 
    this.loadusers();
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


}

