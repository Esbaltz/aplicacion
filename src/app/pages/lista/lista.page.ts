import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Clases, Sesiones } from 'src/app/interfaces/iusuario';
import { FireStoreService } from 'src/app/services/firestore.service';
import { sesionService } from 'src/app/services/sesion.service';
import { user } from '@angular/fire/auth';
import { LocaldbService } from 'src/app/services/localdb.service';
import { AlertController } from '@ionic/angular';


@Component({
  selector: 'app-lista',
  templateUrl: './lista.page.html',
  styleUrls: ['./lista.page.scss'],
})
export class ListaPage implements OnInit {

  cursos : Clases[] = [];
  CursoCargado: Clases = {
    id_alumno : '',
    id_docente : '',
    id_clase : '',
    nomb_clase : '',
    semestre : 0,
    estado : ''

  };
  IdClase : any
  sesiones : Sesiones[] = [];
  userId : any

  NuevaClase: Sesiones = {
    id_clase: '',
    id_sesion: this.firestoreService.createIdDoc(),
    id_docente: this.sesion.getUser()?.id_usuario,
    qr_code: '',
    fecha_hora: new Date('2024-11-09T20:00:00'),
    descripcion: ''
  };

  // Botones de la alerta
  public alertButtons = [
    {
      text: 'Cancelar',
      role: 'cancel',
      handler: () => {
        console.log('Sesión no iniciada');
      }
    },
    {
      text: 'Iniciar',
      handler: (data: any) => {
        // Guardar los datos de la clase al presionar "Iniciar"
        this.iniciarSesion(data);
      }
    }
  ];

  // Inputs de la alerta, asegurándonos de que 'type' esté tipado correctamente
  public alertInputs = [
    {
      placeholder: 'Qr',
      name: 'qr_code',
      type: 'text' as 'text',  // Aquí lo especificamos como tipo 'text'
    },
    {
      placeholder: 'Fecha: (ejemplo: 12/08/2024)',
      name: 'fecha',
      type: 'text' as 'text',  // Tipo 'text' explícitamente
      attributes: {
        maxlength: 10,
      },
    },
    {
      placeholder: 'Hora: (ejemplo: 22:12)',
      name: 'hora',
      type: 'text' as 'text',  // Tipo 'text' explícitamente
      attributes: {
        maxlength: 5,
      },
    },
    {
      type: 'textarea' as 'textarea',  // Aquí especificamos que es un textarea
      placeholder: 'Una descripción de la clase',
      name: 'descripcion',
    },
  ];


  constructor( private firestoreService : FireStoreService , 
               private sesion : sesionService , private route: ActivatedRoute , 
               private db: LocaldbService , private alertController: AlertController) {
    this.userId = this.sesion.getUser()?.id_usuario; 
  }

  ngOnInit( ) {
    this.CargarCursos();
    const ClaseId = this.route.snapshot.paramMap.get('id');
    if (ClaseId) {
      this.cargarCurso(ClaseId);
    }
    this.CargarSesiones()
  }

  cargarCurso(id_clase: string) {
    this.firestoreService.getDocument<Clases>('Clases', id_clase).subscribe(curso => {
      if (curso) {
        this.CursoCargado = curso;
        console.log('Curso cargado:', this.CursoCargado); 
        this.IdClase = this.CursoCargado.id_clase
      }
    });
  }

  CargarCursos(){
    this.firestoreService.getCollectionChanges<Clases>('Clases').subscribe( data => {
      console.log(data);
      if (data) {
        this.cursos = data
        console.log("Cursos Cargados")
         
      }
    })
  }

  CargarSesiones(){
    this.firestoreService.getCollectionChanges<{ id_clase : string,id_sesion: string  }>('Sesiones')
      .subscribe(SesionesIns => {
        if (SesionesIns) {
          console.log('SesionesIns =>',SesionesIns) // Muestra todas
          console.log('Id-clase : ',this.IdClase)
          const SesionesCurso = SesionesIns.filter(s => s.id_clase == this.IdClase );
          console.log('SesionesCurso', SesionesCurso)

          const SesionIds = SesionesCurso.map(s => s.id_sesion);
          console.log('SesionIds =>',SesionIds)

          this.firestoreService.getCollectionChanges<Sesiones>('Sesiones').subscribe(data => {
            if (data) {
              console.log(data)
              this.sesiones = data.filter(sesion => SesionIds.includes(sesion.id_sesion));
              console.log(this.sesion)
            }
          })
        }
      });
  }

  async mostrarAlerta() {
    const alert = await this.alertController.create({
      header: 'Nueva Clase',
      inputs: this.alertInputs, 
      buttons: this.alertButtons
    });

    await alert.present();
  }

  // Método para iniciar la sesión
  iniciarSesion(data: any) {
    // Validar y formatear la fecha y hora
    const [day, month, year] = data.fecha.split('/');
    const [hour, minute] = data.hora.split(':');

    // Asegurarse de que la fecha y hora tengan un formato válido
    if (year && month && day && hour && minute) {
      this.NuevaClase.qr_code = data.qr_code;
      this.NuevaClase.fecha_hora = new Date(`${year}-${month}-${day}T${hour}:${minute}:00`);
      this.NuevaClase.descripcion = data.descripcion;
      this.NuevaClase.id_clase = this.IdClase 
      console.log('Nueva sesion Creada: ', this.NuevaClase);

      // Almacenar en localStorage (o donde desees)
      localStorage.setItem('sesion_' + this.NuevaClase.id_sesion, JSON.stringify(this.NuevaClase));
      this.firestoreService.createDocumentID(this.NuevaClase,'Sesiones' ,this.NuevaClase.id_sesion)
    } else {
      console.error('Fecha o hora no válidas');
    }
  }

}
