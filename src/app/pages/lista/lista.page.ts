import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Alumno, Asistencia, Clases, Sesiones, Usuario } from 'src/app/interfaces/iusuario';
import { FireStoreService } from 'src/app/services/firestore.service';
import { sesionService } from 'src/app/services/sesion.service';
import { user } from '@angular/fire/auth';
import { LocaldbService } from 'src/app/services/localdb.service';
import { AlertController, AlertInput, ToastController } from '@ionic/angular';
import { DatePipe } from '@angular/common';


@Component({
  selector: 'app-lista',
  templateUrl: './lista.page.html',
  styleUrls: ['./lista.page.scss'],
  providers: [DatePipe]
})
export class ListaPage implements OnInit {
 
  asistencias: (Asistencia & { nombre?: string; apellido?: string })[] = [];

  usuarios :Usuario[] = []; // para todos los usuarios
  alumnos : Usuario = { // para manipular a los alumons 
    id_usuario : '',
    nombre : '',
    apellido :'',
    correo :'',
    password : '',
    rol : ''
  };

  Listasistencia : Asistencia = {  // Para crear las asistencias
    id_clase : '',
    id_alumno : '',
    id_sesion : '',
    id_asistencia : '',
    estado : '',
    fecha_hora : new Date()
  }

  cursos : Clases[] = []; // para cargar todos los cursos
  CursoCargado: Clases = { // para cargar un curso en especifico
    alumnos : [],
    id_docente : '',
    id_clase : '',
    nomb_clase : '',
    semestre : 0,
    estado : '',
    descripcion : '',
    seccion_letra: '',
    seccion_num : 1,
    nomb_docente : ''

  };

  alumnosCargados : Alumno[] = []
  IdClase : any // para almacenar el Id del curso que quier ver las asistencias y sesiones
  sesionesProfe : Sesiones[] = []; // para cargar todas las sesiones/clases
  userId : any // Para almacenar el Id del usuario que esta logeado
  fechaActual = Date()

  NuevaClase: Sesiones = { // para crear la nueva clase o sesion
    id_clase: '',
    id_sesion: '',
    id_docente: this.sesion.getUser()?.id_usuario,
    qr_code: '',
    fecha_hora: new Date(),
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
        type: 'textarea',  
        placeholder: 'Ingresa una breve descripcion de lo que se pasara en la clase',
        name: 'descripcion',
        attributes: {
          rows: 6,
          cols: 40,
        },
      },
    ];
  }
 
  isModalOpen = false;

  constructor( private firestoreService : FireStoreService , 
               private sesion : sesionService , private route: ActivatedRoute , 
               private db: LocaldbService , private alertController: AlertController,
               private router: Router,
               private datePipe: DatePipe ,
               private toastController: ToastController) {
    this.userId = this.sesion.getUser()?.id_usuario; 

    this.loadasistencia();
  }

  ngOnInit( ) {
    const ClaseId = this.route.snapshot.paramMap.get('id');
    if (ClaseId) {
      this.cargarCurso(ClaseId);
    }
    this.CargarSesiones()

  }
  formatFecha(timestamp: any): string {
    if (timestamp && timestamp.seconds) {
      const date = new Date(timestamp.seconds * 1000); 
      return this.datePipe.transform(date, 'dd/MM/yyyy')!;
    }
    return ''; 
  }

  formatHora(timestamp: any): string {
    if (timestamp && timestamp.seconds) {
      const date = new Date(timestamp.seconds * 1000); 
      return this.datePipe.transform(date, 'HH:mm')!;
    }
    return ''; 
  }

   formatoFecha(fecha: Date): string {
    const dia: number = fecha.getDate();
    const mes: number = fecha.getMonth() + 1;  
    const año: number = fecha.getFullYear();
  
    const diaFormateado: string = String(dia).padStart(2, '0');
    const mesFormateado: string = String(mes).padStart(2, '0');
  
    // Retornar la fecha en el formato 'DD/MM/YYYY'
    return `${diaFormateado}/${mesFormateado}/${año}`;
  }

  loadasistencia() {
    // Se cargan todos los usuarios
    this.firestoreService.getCollectionChanges<Usuario>('Usuarios').subscribe((usuarios) => {
      if (usuarios) {
        this.usuarios = usuarios;
        //console.log('Usuarios cargados:', this.usuarios);
        
        // acá se cargan los asistencias
        this.firestoreService.getCollectionChanges<Asistencia>('Asistencia').subscribe((asistencias) => {
          if (asistencias) {
            // se busca al usuario con el id del usario
            this.asistencias = asistencias.map((asistencia) => {
              const alumno = this.usuarios.find((user) => user.id_usuario === asistencia.id_alumno);

              return {
                ...asistencia,
                nombre: alumno ? alumno.nombre : 'Desconocido',
                apellido: alumno ? alumno.apellido : 'Desconocido'
              };
            });
            
          }
        });
      }
    });
  }

  cargarCurso(id_clase: string) {
    this.firestoreService.getDocument<Clases>('Clases', id_clase).subscribe(curso => {
      if (curso) {
        this.CursoCargado = curso;
        console.log('Curso cargado:', this.CursoCargado); 
        this.IdClase = this.CursoCargado.id_clase
        this.alumnosCargados = this.CursoCargado.alumnos
        console.log('Alumnos del curso ',this.alumnosCargados)
      }
    });
  }


  CargarSesiones(){
    this.firestoreService.getCollectionChanges<{ id_clase : string,id_sesion: string  , id_docente : string}>('Sesiones')
      .subscribe(SesionesIns => {
        if (SesionesIns) {
          //console.log('SesionesIns =>',SesionesIns) // Muestra todas
          //console.log('Id-clase : ',this.IdClase)
          const SesionesCurso = SesionesIns.filter(s => s.id_clase == this.IdClase && s.id_docente == this.userId);
          //console.log('SesionesCurso', SesionesCurso)

          const SesionIds = SesionesCurso.map(s => s.id_sesion);
          //console.log('SesionIds =>',SesionIds)

          this.firestoreService.getCollectionChanges<Sesiones>('Sesiones').subscribe(data => {
            if (data) {
              //console.log(data)
              this.sesionesProfe = data.filter(sesion => SesionIds.includes(sesion.id_sesion));
              //console.log(this.sesion)

              if (this.sesionesProfe.length > 1) {
                this.GuardarSesionesDelLocal(this.sesionesProfe);
              } else {
                console.log('No hay Sesiones para guardar');
              }
            }
          })
        }
      });
  }

  async GuardarSesionesDelLocal(sesionesProfe: Sesiones[]) {
    try {
      // Guardar los cursos en localStorage
      localStorage.setItem('sesionesProfe', JSON.stringify(sesionesProfe));
      this.db.guardar('sesionesProfe',sesionesProfe)
      console.log('Sesiones guardadas en el local');
    } catch (error) {
      console.error('Error guardando las sesiones en local:', error);
    }
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
    this.NuevaClase.id_sesion = this.firestoreService.createIdDoc();
    this.NuevaClase.qr_code = this.NuevaClase.id_sesion;
    this.NuevaClase.fecha_hora = new Date();
    this.NuevaClase.descripcion = data.descripcion;
    this.NuevaClase.id_clase = this.IdClase 
    console.log('Nueva sesion Creada: ', this.NuevaClase);

      // Aqui lo almaceno en la firebase
    localStorage.setItem('sesion_' + this.NuevaClase.id_sesion, JSON.stringify(this.NuevaClase));
    this.firestoreService.createDocumentID(this.NuevaClase,'Sesiones' ,this.NuevaClase.id_sesion)
    this.NuevaSesion('top')
    for ( let alumno of this.alumnosCargados) {
      const idUnico = this.firestoreService.createIdDoc();
      
      // Crear la asistencia para este alumno
      const nuevaAsistencia = {
        id_alumno: alumno,  
        fecha_hora: new Date(),
        id_sesion: this.NuevaClase.id_sesion,
        estado: 'Ausente',
        id_asistencia: idUnico,
        id_clase: this.IdClase };
      // Guardar en localStorage y en Firebase
      localStorage.setItem('asistencia_' + nuevaAsistencia.id_asistencia, JSON.stringify(nuevaAsistencia));
      console.log('Lista de Asistencia:', nuevaAsistencia);
      this.firestoreService.createDocumentID(nuevaAsistencia, 'Asistencia', nuevaAsistencia.id_asistencia);

      }
    
        
  }

  QrXsesion( sesion : Sesiones){
    console.log('Sesion=>', sesion)
    this.router.navigate(['/codigo',sesion.id_sesion] );
    console.log('Se a guardado la sesion con el ID =',sesion.id_sesion , 'y el QR =',sesion.qr_code)

  }

  async NuevaSesion(position: 'top' | 'middle' | 'bottom') {
    const toast = await this.toastController.create({
      message: `Has iniciado un nueva clase `,
      duration: 1500,
      position: position,
      color: 'secondary',
      header: 'Aviso!',
      cssClass: 'textoast',
    });

    await toast.present();
  }

  
}


