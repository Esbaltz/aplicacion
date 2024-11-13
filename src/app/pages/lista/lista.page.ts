import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Asistencia, Clases, Sesiones, Usuario } from 'src/app/interfaces/iusuario';
import { FireStoreService } from 'src/app/services/firestore.service';
import { sesionService } from 'src/app/services/sesion.service';
import { user } from '@angular/fire/auth';
import { LocaldbService } from 'src/app/services/localdb.service';
import { AlertController, AlertInput } from '@ionic/angular';


@Component({
  selector: 'app-lista',
  templateUrl: './lista.page.html',
  styleUrls: ['./lista.page.scss'],
})
export class ListaPage implements OnInit {
 
  asistencias : Asistencia[] = [];
  usuarios :Usuario[] = [];
  alumnos : Usuario = {
    id_usuario : '',
    nombre : '',
    apellido :'',
    correo :'',
    password : '',
    rol : ''
  };

  Listasistencia : Asistencia = {
    id_clase : '',
    id_alumno : '',
    id_sesion : '',
    id_asistencia : '',
    estado : '',
    fecha_hora : new Date('2024-11-09T20:00:00')
  }

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

  public alertButtons = [
    {
      text: 'Cancelar',
      role: 'cancel',
      handler: () => {
        console.log('Clase cancelada');
      }
    },
    {
      text: 'Iniciar',
      handler: (data: any) => {
        this.iniciarSesion(data);
      }
    }
  ];

  public getAlertInputs(): AlertInput[] {
    return [
      {
        placeholder: 'Fecha: (ejemplo: 12/08/2024)',
        name: 'fecha',
        type: 'text',  
        attributes: {
          maxlength: 10,
        },
      },
      {
        placeholder: 'Hora: (ejemplo: 22:12)',
        name: 'hora',
        type: 'text',  
        attributes: {
          maxlength: 5,
        },
      },
      {
        type: 'textarea',  
        placeholder: 'Una descripción de la clase',
        name: 'descripcion',
      },
    ];
  }
 
  isModalOpen = false;
  qrValue = '';


  constructor( private firestoreService : FireStoreService , 
               private sesion : sesionService , private route: ActivatedRoute , 
               private db: LocaldbService , private alertController: AlertController,
               private router: Router) {
    this.userId = this.sesion.getUser()?.id_usuario; 
    this.Usuarios();
    this.loadasistencia();
  }

  ngOnInit( ) {
    this.cargarUsuarios();
    this.CargarCursos();
    const ClaseId = this.route.snapshot.paramMap.get('id');
    if (ClaseId) {
      this.cargarCurso(ClaseId);
    }
    this.CargarSesiones()

  }

  loadasistencia(){
    this.firestoreService.getCollectionChanges<Asistencia>('Asistencia').subscribe( data => {
      console.log(data);
      if (data) {
        this.asistencias = data
        console.log('Todas las asistencias => ',this.asistencias)
      }
    })
  }

  cargarUsuarios(){
    this.firestoreService.getCollectionChanges<Usuario>('Usuarios').subscribe(data =>{
      console.log(data)
      if(data){
        console.log('Todos los usuarios =>',this.usuarios)
        this.usuarios = data
      }
    })
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
      inputs: this.getAlertInputs(),  
      buttons: this.alertButtons
    });
  
    await alert.present();
  }

  iniciarSesion(data: any) {

    const [day, month, year] = data.fecha.split('/');
    const [hour, minute] = data.hora.split(':');

    if (year && month && day && hour && minute) {
      this.NuevaClase.qr_code = this.NuevaClase.id_sesion;
      this.NuevaClase.fecha_hora = new Date(`${year}-${month}-${day}T${hour}:${minute}:00`);
      this.NuevaClase.descripcion = data.descripcion;
      this.NuevaClase.id_clase = this.IdClase 
      console.log('Nueva sesion Creada: ', this.NuevaClase);

      // Aqui lo almaceno en la firebase
      localStorage.setItem('sesion_' + this.NuevaClase.id_sesion, JSON.stringify(this.NuevaClase));
      this.firestoreService.createDocumentID(this.NuevaClase,'Sesiones' ,this.NuevaClase.id_sesion)

      //Aqui guardo a los alumnos que se registraran en la asistencia
      this.usuarios.forEach(usuario => {
        if (usuario.rol === 'Alumno') {
          // Crear una nueva instancia para cada alumno
          const idUnico = this.firestoreService.createIdDoc();
          const nuevaAsistencia = {
            id_alumno: usuario.id_usuario,
            fecha_hora: new Date(`${year}-${month}-${day}T${hour}:${minute}:00`),
            id_sesion: this.NuevaClase.id_sesion,
            estado: 'Ausente',
            id_asistencia: idUnico,
            id_clase : this.IdClase
          };
      
          // Guardar en localStorage y en Firebase
          localStorage.setItem('asistencia_' + nuevaAsistencia.id_asistencia, JSON.stringify(nuevaAsistencia));
          console.log('Lista de Asistencia :', nuevaAsistencia);
          //this.firestoreService.createDocumentID(nuevaAsistencia, 'Asistencia', nuevaAsistencia.id_asistencia);
        } else {
          console.log('No se pudo realizar la asistencia');
        }
      });
    } else {
      console.error('Fecha o hora no válidas');
    }
  }

  Usuarios() {
    this.usuarios.forEach(usuario => {
      console.log('Id-User :',usuario.id_usuario)
    })
  }

  QrXsesion( sesion : Sesiones){
    console.log('Sesion=>', sesion)
    this.router.navigate(['/codigo',sesion.id_sesion] );
    console.log('Se a guardado la sesion con el ID =',sesion.id_sesion , 'y el QR =',sesion.qr_code)

  }

  
}


