import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, AlertInput } from '@ionic/angular';
import { Alumno, Clases } from 'src/app/interfaces/iusuario';
import { FireStoreService } from 'src/app/services/firestore.service';
import { LocaldbService } from 'src/app/services/localdb.service';
import { sesionService } from 'src/app/services/sesion.service';

@Component({
  selector: 'app-cursos-disponibles',
  templateUrl: './cursos-disponibles.page.html',
  styleUrls: ['./cursos-disponibles.page.scss'],
})
export class CursosDisponiblesPage implements OnInit {

  cursos : Clases[] = []
  cursosDisponibles: Clases[] = [];
  userId : any

  constructor( private sesion : sesionService , 
              private firestoreService : FireStoreService ,
              private db: LocaldbService , 
              private route: ActivatedRoute,  
              private router: Router,
              private alertController: AlertController) { 

    this.userId = this.sesion.getUser()?.id_usuario;
  }

  ngOnInit() {
    console.log('Id del usuario',this.userId)
    this.CargarCursos();
  }

  CargarCursos() {
    this.firestoreService.getCollectionChanges<Clases>('Clases').subscribe(data => {
      console.log(data);
      if (data) {
        // Filtramos los cursos que no tienen al usuario en el array 'alumnos'
        this.cursos = data.filter(curso => !curso.alumnos.includes(this.userId));
  
        console.log("Cursos Cargados y Filtrados");
      }
    });
  }

  agregarAlumno(claseRecibida: string) {
    const alumno = this.userId;
    const id_clase = claseRecibida; // ID de la clase a la que quieres agregar el alumno
  
    this.firestoreService.agregarAlumnoAClase(id_clase, alumno).then(() => {
      console.log('Alumno agregado correctamente');
      // Recargamos los cursos para actualizar la vista
      this.CargarCursos();  // Esto actualizará la lista de cursos disponibles
  
      // Redirigimos al usuario
      this.router.navigate(['/cursos-alumno']);
    }).catch(error => {
      console.error('Error al agregar el alumno:', error);
    });
  }

  async mostrarAlerta( curso : Clases) {
    const alert = await this.alertController.create({
      header: `${curso.nomb_clase}`,
      inputs: [
        {
          type: 'text',  // Usamos 'text' para un campo de texto simple
          name: 'fecha',
          value: `Semestre : ${curso.semestre}`,  // Valor que deseas mostrar
          disabled: true,  // Establecemos el campo como deshabilitado
        },
        {
          type: 'text',  // Usamos 'text' para la hora
          name: 'hora',
          value: `Estado : ${curso.estado}`,  // Valor que deseas mostrar
          disabled: true,  // Establecemos el campo como deshabilitado
        },
        {
          type: 'textarea',  // Usamos 'textarea' para la descripción
          name: 'descripcion',
          value: `Descripcion : ${curso.descripcion}`,  // Valor de la descripción
          disabled: true,  // Establecemos el campo como deshabilitado
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('No inscrito');
          }
        },
        {
          text: 'Aceptar',
          handler: () => {
            console.log('Curso inscrito',curso.nomb_clase);
            this.agregarAlumno(curso.id_clase)
          }
        }
      ]
    });
  
    await alert.present();
  }

}


