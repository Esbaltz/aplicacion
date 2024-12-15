import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
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
    seccion_num : 0,
    seccion_letra : '',
    nomb_docente : this.sesion.getUser()?.nombre +' '+this.sesion.getUser()?.apellido
  }


  constructor( private sesion : sesionService , private firestoreService : FireStoreService , private db: LocaldbService , private router: Router , private toastController: ToastController) { }

  ngOnInit() {
    this.userId = this.sesion.getUser()?.id_usuario
  }



  AgregarCurso (form: NgForm) {
  
    if (form.valid) { 
      console.log(this.NuevoCurso)
      this.firestoreService.createDocumentID(this.NuevoCurso, 'Clases', this.NuevoCurso.id_clase)
      console.log('Nuevo curso Creado !')
      form.resetForm(); 
      this.router.navigate(['/tabs/cursos'] );
      this.NewCurso('top')
    }
  }

  async NewCurso(position: 'top' | 'middle' | 'bottom') {
    const toast = await this.toastController.create({
      message: `Nuevo curso añadido `,
      duration: 1500,
      position: position,
      color: 'secondary',
      header: 'Aviso!',
      cssClass: 'textoast',
    });

    await toast.present();
  }

}
