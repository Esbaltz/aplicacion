import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Sesiones } from 'src/app/interfaces/iusuario';
import { FireStoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-codigo',
  templateUrl: './codigo.page.html',
  styleUrls: ['./codigo.page.scss'],
})
export class CodigoPage implements OnInit {

  SesionCargada : Sesiones = {
    id_clase: '',
    id_docente :'',
    id_sesion : '',
    qr_code : '',
    fecha_hora : new Date('2024-11-09T20:00:00'),
    descripcion : ''
  }
  QrSesion : any

  constructor(private firestoreService : FireStoreService , private route: ActivatedRoute) { }

  ngOnInit() {
    const SesionId = this.route.snapshot.paramMap.get('id');
    if (SesionId) {
      this.cargarSesion(SesionId);
    }
  }
 
  cargarSesion(id_sesion: string) {
    this.firestoreService.getDocument<Sesiones>('Sesiones', id_sesion).subscribe(sesion => {
      if (sesion) {
        this.SesionCargada = sesion;
        console.log('Sesion cargada:', this.SesionCargada); 
        this.QrSesion = this.SesionCargada.qr_code
      }
    });
  }

}
