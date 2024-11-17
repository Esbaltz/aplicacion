import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { Clases } from 'src/app/interfaces/iusuario';
import { FireStoreService } from 'src/app/services/firestore.service';
import { LocaldbService } from 'src/app/services/localdb.service';
import { sesionService } from 'src/app/services/sesion.service';

@Component({
  selector: 'app-agregar-clase',
  templateUrl: './agregar-clase.page.html',
  styleUrls: ['./agregar-clase.page.scss'],
})
export class AgregarClasePage implements OnInit {

  // Las clases son los cursos
  cursos : Clases[] = [];
  userId : any
  NuevoCurso : Clases = {
    alumnos : [],
    id_clase : this.firestoreService.createIdDoc(),
    id_docente : this.sesion.getUser()?.id_usuario,
    estado : 'Inscrito',
    semestre : 2,
    nomb_clase : '',
    descripcion : '',
    seccion_num : 1,
    seccion_letra : 'A'
  }
  nombreCompleto : any

  constructor( private sesion : sesionService , private firestoreService : FireStoreService , private db: LocaldbService , private router: Router) { }

  ngOnInit() {
    this.userId = this.sesion.getUser()?.id_usuario
    this.nombreCompleto = this.sesion.getUser()?.nombre + ' ' + this.sesion.getUser()?.apellido
  }



  AgregarCurso (form: NgForm) {
  
    if (form.valid) { 
      console.log(this.NuevoCurso)
      this.db.guardar(this.NuevoCurso.id_clase, this.NuevoCurso);
      //this.firestoreService.createDocumentID(this.NuevoCurso, 'Clases', this.NuevoCurso.id_clase)
      this.db.guardar(this.NuevoCurso.id_clase, this.NuevoCurso);
      console.log('Nuevo curso Creado !')
      form.resetForm(); 
      this.router.navigate(['/cursos'] );
    }
  }

}
