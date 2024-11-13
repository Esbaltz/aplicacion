import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { Asistencia, Clases, Sesiones } from 'src/app/interfaces/iusuario';
import { FireStoreService } from 'src/app/services/firestore.service';
import { LocaldbService } from 'src/app/services/localdb.service';
import { sesionService } from 'src/app/services/sesion.service';

@Component({
  selector: 'app-asistencias',
  templateUrl: './asistencias.page.html',
  styleUrls: ['./asistencias.page.scss'],
})
export class AsistenciasPage implements OnInit {
  cursos: Clases[] = [];
  usuarioId : any
  asistencias : Asistencia[] = [];
  sesiones : Sesiones[] = [];
  Asistencia_Actualizada : Asistencia = {
    id_alumno : '',
    id_clase : '',
    id_sesion: '',
    id_asistencia :'',
    estado : '',
    fecha_hora : new Date()
  }
  scanHistory: { data: string }[] = []; 
  EstadoNuevo = 'Presente'
  constructor(private sesion : sesionService , private firestoreService : FireStoreService , private db:LocaldbService , private alertctrl:AlertController , private toastController:ToastController) { 

    this.usuarioId = this.sesion.getUser()?.id_usuario;
  }

  ngOnInit(
  ) {
    this.CargarCursos1()
    console.log('USUARIO ID =>',this.usuarioId)
    this.loadasistencia()
    const storedHistory = localStorage.getItem('scanHistory');
    this.scanHistory = storedHistory ? JSON.parse(storedHistory) : [];
  }

  ScaneoQr() {
      this.scanHistory.forEach( scan => {
        const now = new Date();
        // Extrae cada componente de la fecha actual
        const year: number = now.getFullYear();
        const month: string = (now.getMonth() + 1).toString().padStart(2, '0'); // Mes (0-11), por eso sumamos 1
        const day: string = now.getDate().toString().padStart(2, '0'); // Día del mes
        const hour: string = now.getHours().toString().padStart(2, '0'); // Hora en formato 24h
        const minute: string = now.getMinutes().toString().padStart(2, '0'); // Minuto

        this.asistencias.forEach( asistencia => {
          if ( asistencia.id_sesion === scan.data && asistencia.id_alumno === this.usuarioId) {
              const NuevaAsistencia = {
                id_alumno: this.usuarioId,
                fecha_hora: new Date(`${year}-${month}-${day}T${hour}:${minute}:00`),
                id_sesion: scan.data[0],
                estado: 'Presente',
                id_asistencia: asistencia.id_asistencia,
                id_clase : asistencia.id_clase
              };
              console.log('Este asistencia se guardo')
              this.db.guardar(NuevaAsistencia.id_asistencia , NuevaAsistencia)
              localStorage.setItem('asistencia_' + NuevaAsistencia.id_asistencia, JSON.stringify(NuevaAsistencia));
              //this.firestoreService.updateDocumentID(NuevaAsistencia,'Asistencia',NuevaAsistencia.id_asistencia)
          } else {
            console.log('Alumno no a escaneado el qr todavia')
          }
        })})
  }

  CargarCursos(){
    this.firestoreService.getCollectionChanges<Clases>('Clases').subscribe( data => {
      console.log(data);
      if (data) {
        this.cursos = data
      }
    })
  }

  loadasistencia(){
    this.firestoreService.getCollectionChanges<Asistencia>('Asistencia').subscribe( data => {
      console.log(data);
      if (data) {
        this.asistencias = data

      }
    })
  }

  loadsesiones(){
    this.firestoreService.getCollectionChanges<Sesiones>('Sesiones').subscribe( data => {
      console.log(data);
      if (data) {
        this.sesiones = data

      }
    })
  }

  CargarCursos1() {
    this.firestoreService.getCollectionChanges<{ id_alumno: string, id_clase: string }>('Clases')
      .subscribe(ClasesIns => {
        if (ClasesIns) {
          const ClasesUsuario = ClasesIns.filter(c => c.id_alumno === this.usuarioId);
          console.log('ClasesUsuario', ClasesUsuario)

          const ClasesIds = ClasesUsuario.map(c => c.id_clase)

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

  async Alerta(position: 'top' | 'middle' | 'bottom') {
    const toast = await this.toastController.create({
      message: 'El qr no tiene datos',
      duration: 1500,
      position: position,
      color: 'danger',
      header: 'Error!',
      cssClass: 'textoast',
    });

    await toast.present();
  }

  async Alerta2(position: 'top' | 'middle' | 'bottom') {
    const toast = await this.toastController.create({
      message: 'El qr no entro al for',
      duration: 1500,
      position: position,
      color: 'danger',
      header: 'Error!',
      cssClass: 'textoast',
    });

    await toast.present();
  }

  async Alerta3(position: 'top' | 'middle' | 'bottom') {
    const toast = await this.toastController.create({
      message: 'El qr entro al if',
      duration: 1500,
      position: position,
      color: 'danger',
      header: 'Error!',
      cssClass: 'textoast',
    });

    await toast.present();
  }
}
