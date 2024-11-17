import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { Asistencia, Clases, Sesiones } from 'src/app/interfaces/iusuario';
import { FireStoreService } from 'src/app/services/firestore.service';
import { LocaldbService } from 'src/app/services/localdb.service';
import { sesionService } from 'src/app/services/sesion.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-asistencias',
  templateUrl: './asistencias.page.html',
  styleUrls: ['./asistencias.page.scss'],
  providers: [DatePipe]
})
export class AsistenciasPage implements OnInit {
  cursos: Clases[] = [];
  usuarioId : any
  asistencias : Asistencia[] = [];
  sesiones : Sesiones[] = [];

  constructor(private datePipe: DatePipe,private sesion : sesionService , private firestoreService : FireStoreService , private db:LocaldbService , private alertctrl:AlertController , private toastController:ToastController) { 

    this.usuarioId = this.sesion.getUser()?.id_usuario;
  }

  ngOnInit(
  ) {
    this.CargarCursos()
    console.log('USUARIO ID =>',this.usuarioId)
    this.loadasistencia()
    
  }
  formatFechaHora(timestamp: any): string {
    if (timestamp && timestamp.seconds) {
      // Convertir el Timestamp de Firebase a un objeto Date
      const date = new Date(timestamp.seconds * 1000); // Convertir de segundos a milisegundos
      return this.datePipe.transform(date, 'dd/MM/yyyy HH:mm')!;
    }
    return ''; // Si no hay un Timestamp válido, devolver una cadena vacía
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
