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
  curso! : Clases;
  UsuarioId =  this.sesion.getUser()?.id_usuario;

  constructor( private sesion : sesionService , private firestoreService : FireStoreService) { }

  ngOnInit() {
  }

  CargarCursos ( id : string) {

    this.firestoreService.getDocument<Clases>('Clases', id ).subscribe( cursos => {
      if (cursos) {
        this.curso = cursos
      } else {
        console.error('No se encontraron las clases.');
      
      }});

  }
}
