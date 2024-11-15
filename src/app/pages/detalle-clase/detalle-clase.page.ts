import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Clases } from 'src/app/interfaces/iusuario';
import { FireStoreService } from 'src/app/services/firestore.service';
import { sesionService } from 'src/app/services/sesion.service';

@Component({
  selector: 'app-detalle-clase',
  templateUrl: './detalle-clase.page.html',
  styleUrls: ['./detalle-clase.page.scss'],
})
export class DetalleClasePage implements OnInit {

  CursoCargado : Clases = {
    nomb_clase : '',
    descripcion : '',
    semestre : 0,
    id_alumno: '',
    id_clase: '',
    id_docente :'',
    estado : ''
  }
  Idclase : any

  rol : any
  constructor(private firestoreService : FireStoreService , private route: ActivatedRoute , private sesion : sesionService ) { }

  ngOnInit() {
    
    this.rol = this.sesion.getUser()?.rol
    const ClaseId = this.route.snapshot.paramMap.get('id');
    console.log("ClaseId recibido: ", ClaseId);  
    if (ClaseId) {
      this.CargarCurso(ClaseId);
    } else {
      console.log("ID de clase no encontrado en la URL.");
    }
  }

  CargarCurso( id_clase :string ){
    this.firestoreService.getDocument<Clases>('Clases', id_clase).subscribe(clase => {
      if (clase) {
        this.CursoCargado = clase;
        console.log('Curso cargado:', this.CursoCargado); 
        this.Idclase = this.CursoCargado.id_clase
      }
    });
  }

}
