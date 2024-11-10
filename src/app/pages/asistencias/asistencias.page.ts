import { Component, OnInit } from '@angular/core';
import { Clases } from 'src/app/interfaces/iusuario';
import { FireStoreService } from 'src/app/services/firestore.service';
import { sesionService } from 'src/app/services/sesion.service';

@Component({
  selector: 'app-asistencias',
  templateUrl: './asistencias.page.html',
  styleUrls: ['./asistencias.page.scss'],
})
export class AsistenciasPage implements OnInit {
  cursos: Clases[] = [];
  userId: any;
  scanHistory: { date: string, data: string }[] = [];  // Definir scanHistory aquí

  constructor(
    private sesion: sesionService,
    private firestoreService: FireStoreService
  ) {
    this.userId = this.sesion.getUser()?.id_usuario;
  }

  ngOnInit() {
    this.CargarCursos1();
    const storedHistory = localStorage.getItem('scanHistory');
    this.scanHistory = storedHistory ? JSON.parse(storedHistory) : [];
  }

  CargarCursos() {
    this.firestoreService.getCollectionChanges<Clases>('Clases').subscribe((data) => {
      if (data) {
        this.cursos = data;
      }
    });
  }

  CargarCursos1() {
    this.firestoreService.getCollectionChanges<{ id_alumno: string; id_clase: string }>('Clases')
      .subscribe((ClasesIns) => {
        if (ClasesIns) {
          const ClasesUsuario = ClasesIns.filter((c) => c.id_alumno === this.userId);
          const ClasesIds = ClasesUsuario.map((c) => c.id_clase);

          this.firestoreService.getCollectionChanges<Clases>('Clases').subscribe((data) => {
            if (data) {
              this.cursos = data.filter((curso) => ClasesIds.includes(curso.id_clase));
            }
          });
        }
      });
  }
}