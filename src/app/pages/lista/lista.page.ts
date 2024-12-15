import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Alumno, Asistencia, Clases, Sesiones, Usuario } from 'src/app/interfaces/iusuario';
import { FireStoreService } from 'src/app/services/firestore.service';
import { sesionService } from 'src/app/services/sesion.service';
import { user } from '@angular/fire/auth';
import { LocaldbService } from 'src/app/services/localdb.service';
import { AlertController, AlertInput, ToastController } from '@ionic/angular';
import { DatePipe } from '@angular/common';
import { NetworkService } from 'src/app/services/network.service';
import { Timestamp } from '@angular/fire/firestore';


@Component({
  selector: 'app-lista',
  templateUrl: './lista.page.html',
  styleUrls: ['./lista.page.scss'],
  providers: [DatePipe]
})
export class ListaPage implements OnInit {
 
  asistenciasProfe: (Asistencia & { nombre?: string; apellido?: string })[] = [];

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
        if (this.networkService.isConnected()) {
          this.iniciarSesion(data);
        }else{
          this.SesionSinConexion('top')
        }

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

  today: string = new Date().toISOString().split('T')[0];  // Fecha de hoy en formato 'yyyy-MM-dd'
  mostrarBoton: boolean = true;
 
  isModalOpen = false;

  constructor( private firestoreService : FireStoreService , 
               private sesion : sesionService , private route: ActivatedRoute , 
               private db: LocaldbService , private alertController: AlertController,
               private router: Router,
               private datePipe: DatePipe ,
               private toastController: ToastController,
               private networkService: NetworkService) {
    this.userId = this.sesion.getUser()?.id_usuario; 

  }

  async ngOnInit() {
    const ClaseId = this.route.snapshot.paramMap.get('id');
    if (ClaseId) {
      this.cargarCurso(ClaseId);
      this.CargarSesiones(); // Cargar sesiones
      this.loadasistencia();
    }
  
    if (this.networkService.isConnected()) {
      console.log('Conectado a Internet');
    } else {
      console.log('No tienes conexion');
      await this.CargarSesionesDeLocal();
      await this.CargarAsistenciasDeLocal();
    }
    
    // Asegúrate de que las sesiones estén cargadas antes de verificar la clase de hoy
    await this.checkClaseHoy();
  }
  

  checkClaseHoy() {
    const today = new Date().toISOString().split('T')[0]; // Fecha de hoy en formato 'yyyy-MM-dd'
  
    console.log("Fecha actual (today):", today);  // Verifica la fecha de hoy
  
    const claseHoy = this.sesionesProfe.some(sesion => {
      let fechaSesion: string;
  
      if (sesion.fecha_hora instanceof Date) {
        fechaSesion = new Date(sesion.fecha_hora).toISOString().split('T')[0];
      } else if (sesion.fecha_hora instanceof Timestamp) {
        fechaSesion = new Date(sesion.fecha_hora.seconds * 1000).toISOString().split('T')[0];
      } else {
        fechaSesion = '';
      }
  
      console.log("Fecha de sesión:", fechaSesion);  // Verifica la fecha de la sesión
  
      return fechaSesion === today;  // Compara solo la fecha sin la hora
    });
  
    console.log("Clase hoy:", claseHoy);  // Verifica si se encontró una clase hoy
  
    this.mostrarBoton = !claseHoy;  // Si hay clase hoy, ocultar el botón
    console.log("Estado de mostrarBoton después de la verificación:", this.mostrarBoton);  // Verifica el valor de mostrarBoton
  }
  
  

  formatFecha(timestamp: any): string {
    if (timestamp && timestamp.seconds) {
      const date = new Date(timestamp.seconds * 1000); 
      return this.datePipe.transform(date, 'dd/MM/yyyy')!;
    }
    return ''; 
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
            this.asistenciasProfe = asistencias.map((asistencia) => {
              const alumno = this.usuarios.find((user) => user.id_usuario === asistencia.id_alumno);

              return {
                ...asistencia,
                nombre: alumno ? alumno.nombre : 'Desconocido',
                apellido: alumno ? alumno.apellido : 'Desconocido'

                
              };

            });

            if (this.asistenciasProfe.length > 1) {
              this.GuardarAsistenciasDelLocal(this.asistenciasProfe);
            } else {
              console.log('No hay Asistencias para guardar');
            }
            
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
              console.log('Sesiones de esta clase =>',this.sesionesProfe)

              this.checkClaseHoy();

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
      localStorage.setItem('sesionesProfe'+this.IdClase, JSON.stringify(sesionesProfe));
      this.db.guardar('sesionesProfe'+this.IdClase,sesionesProfe)
      console.log('Sesiones guardadas en el local');
    } catch (error) {
      console.error('Error guardando las sesiones en local:', error);
    }
  }

  async CargarSesionesDeLocal() {
    // Intentar cargar las sesiones de Localdb
    const sesionesGuardadas = await this.db.getData('sesionesProfe'+this.IdClase);
    console.log('Sesiones cargadas desde Localdb:', sesionesGuardadas);
  
    if (sesionesGuardadas && sesionesGuardadas.length > 0) {
      console.log('Se cargaron las sesiones desde Localdb');
      this.sesionesProfe = sesionesGuardadas;
    } else {
      // Si no se encontraron, intentar cargar desde localStorage
      const sesionesDesdeStorage = JSON.parse(localStorage.getItem('sesionesProfe'+this.IdClase) || '[]');
      console.log('Sesione cargadas desde localStorage:', sesionesDesdeStorage);
      this.sesionesProfe = sesionesDesdeStorage;
    }
  }

  async GuardarAsistenciasDelLocal(asistenciaProfe: Asistencia[]) {
    try {
      // Guardar los cursos en localStorage
      localStorage.setItem('asistenciaProfe', JSON.stringify(asistenciaProfe));
      this.db.guardar('asistenciaProfe',asistenciaProfe)
      console.log('Sesiones guardadas en el local');
    } catch (error) {
      console.error('Error guardando las sesiones en local:', error);
    }
  }

  async CargarAsistenciasDeLocal() {
    // Intentar cargar las asistencias de Localdb
    const asistenciasGuardadas = await this.db.getData('asistenciaProfe');
    console.log('Asistencias cargadas desde Localdb:', asistenciasGuardadas);
  
    if (asistenciasGuardadas && asistenciasGuardadas.length > 0) {
      console.log('Se cargaron las asistencias desde Localdb');
      this.asistenciasProfe = asistenciasGuardadas;
    } else {
      // Si no se encontraron, intentar cargar desde localStorage
      const asistenciasDesdeStorage = JSON.parse(localStorage.getItem('asistenciaProfe') || '[]');
      console.log('asistencias cargadas desde localStorage:', asistenciasDesdeStorage);
      this.asistenciasProfe = asistenciasDesdeStorage;
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

  async SesionSinConexion(position: 'top' | 'middle' | 'bottom') {
    const toast = await this.toastController.create({
      message: `No tienes conexion para iniciar la clase `,
      duration: 1500,
      position: position,
      color: 'danger',
      header: 'Aviso!',
      cssClass: 'textoast',
    });

    await toast.present();
  }

  
}


