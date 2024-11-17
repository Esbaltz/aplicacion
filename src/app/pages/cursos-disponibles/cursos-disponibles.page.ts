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
        this.cursos = data.filter(curso => !curso.alumnos.includes(this.userId));
  
        console.log("Cursos Cargados y Filtrados");
      }
    });
  }

  agregarAlumno(claseRecibida: string) {
    const alumno = this.userId;
    const id_clase = claseRecibida; 
  
    this.firestoreService.agregarAlumnoAClase(id_clase, alumno).then(() => {
      console.log('Alumno agregado correctamente');
      this.CargarCursos();  
  
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
          type: 'text',  
          name: 'fecha',
          value: `Semestre : ${curso.semestre}`, 
          disabled: true,  
        },
        {
          type: 'text',  
          name: 'hora',
          value: `Estado : ${curso.estado}`,  
          disabled: true,  
        },
        {
          type: 'textarea',  
          name: 'descripcion',
          value: `Descripcion : ${curso.descripcion}`,  
          disabled: true,  
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


