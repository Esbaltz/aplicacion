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
  userId : any

  alumnos : Alumno = {
    id_alumno: ''
  }

  constructor( private sesion : sesionService , 
              private firestoreService : FireStoreService ,
              private db: LocaldbService , 
              private route: ActivatedRoute,  
              private router: Router,
              private alertController: AlertController) { 

    this.userId = this.sesion.getUser()?.id_usuario;
  }

  ngOnInit() {
    this.CargarDisponibles();
  }

  // Hay que arreglarlo
  CargarDisponibles() {
    this.firestoreService.getCollectionChanges<{ alumnos: [ ], id_clase: string }>('Clases')
      .subscribe(ClasesIns => {
        if (ClasesIns) {
          console.log('ClasesIns =>',ClasesIns)

          const ClasesUsuario = ClasesIns.filter(c => c.alumnos !== this.userId);
          console.log('ClasesUsuario', ClasesUsuario)

          const ClasesIds = ClasesUsuario.map(c => c.id_clase );
          console.log('ClasesIds =>',ClasesIds)

          this.firestoreService.getCollectionChanges<Clases>('Clases').subscribe(data => {
            if (data) {
              console.log(data)
              this.cursos = data.filter(curso => ClasesIds.includes(curso.id_clase));
              console.log(this.cursos)
            }
          })
        }
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
          }
        }
      ]
    });
  
    await alert.present();
  }

}


