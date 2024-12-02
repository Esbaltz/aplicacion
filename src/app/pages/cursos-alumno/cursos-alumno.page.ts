import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { Alumno, Clases } from 'src/app/interfaces/iusuario';
import { FireStoreService } from 'src/app/services/firestore.service';
import { LocaldbService } from 'src/app/services/localdb.service';
import { NetworkService } from 'src/app/services/network.service';
import { sesionService } from 'src/app/services/sesion.service';

@Component({
  selector: 'app-cursos-alumno',
  templateUrl: './cursos-alumno.page.html',
  styleUrls: ['./cursos-alumno.page.scss'],
})
export class CursosAlumnoPage implements OnInit {

  cursosAlumno : Clases[] = [];

  userId : any

  constructor( private sesion : sesionService , 
    private firestoreService : FireStoreService , 
    private db: LocaldbService , 
    private route: ActivatedRoute,  
    private router: Router,
    private networkService: NetworkService,
    private toastController: ToastController) { 

    this.userId = this.sesion.getUser()?.id_usuario;

  }

  async ngOnInit() {
    if (this.networkService.isConnected()) {
      console.log('Tienes conexión a Internet.');
      await this.CargarCursosAlumno(); // Cargar cursos desde Firebase
      if (this.cursosAlumno.length > 1) {
        await this.GuardarCursosLocal(this.cursosAlumno); // Guardar cursos si existen
      } else {
        console.log('No hay cursos para guardar');
      }
    } else {
      console.log('No hay conexión a Internet.');
      this.MensajeSinConexion('top')
      await this.CargarCursosDeLocal(); // Cargar cursos desde almacenamiento local
    }
  }

  async GuardarCursosLocal(cursosAlumno: Clases[]) {
    try {
      // Guardar los cursos en localStorage
      localStorage.setItem('cursosAlumno', JSON.stringify(cursosAlumno));
      this.db.guardar('cursosAlumno',cursosAlumno)
      console.log('Cursos guardados en el local');
    } catch (error) {
      console.error('Error guardando los cursos en local:', error);
    }
  }

  async CargarCursosDeLocal() {
    // Intenta cargar los cursos de Localdb primero
    const cursosGuardados = await this.db.obtener('cursosAlumno');
    console.log('Cursos guardados desde Localdb:', cursosGuardados);
    if (cursosGuardados) {
      this.cursosAlumno = cursosGuardados;
    } else {
      // Si no se encontraron, intenta cargar desde localStorage
      const cursosDesdeStorage = JSON.parse(localStorage.getItem('cursosAlumno') || '[]');
      console.log('Cursos guardados desde localStorage:', cursosDesdeStorage);
      this.cursosAlumno = cursosDesdeStorage;
    }
  }

  CargarCursosAlumno() {
    this.firestoreService.getCollectionChanges<{ alumnos: Alumno[], id_clase: string }>('Clases')
      .subscribe(ClasesIns => {
        if (ClasesIns) {

          const ClasesUsuario = ClasesIns.filter(c => c.alumnos.some(alumno => alumno === this.userId));
  
          const ClasesIds = ClasesUsuario.map(c => c.id_clase);
  
          this.firestoreService.getCollectionChanges<Clases>('Clases').subscribe(data => {
            if (data) {
              this.cursosAlumno = data.filter(curso => ClasesIds.includes(curso.id_clase));
              console.log("Cursos del alumno =>",this.cursosAlumno);
            }

            if (this.cursosAlumno.length > 1) {
              this.GuardarCursosLocal(this.cursosAlumno);
            } else {
              console.log('No hay cursos para guardar');
            }
          });
        }
      });
  }

  DetalleCurso ( clases : Clases )  {

    if ( clases === null) {
      console.log('Id clase no encontrado')
    }else {
      console.log('CURSO =>', clases)
      this.router.navigate(['/detalle-clase',clases.id_clase] );
      console.log('Se a guardado el curso con el ID =',clases.id_clase)
    }
  }

  async MensajeSinConexion(position: 'top' | 'middle' | 'bottom') {
    const toast = await this.toastController.create({
      message: `No tienes conexiona a Internet `,
      duration: 1500,
      position: position,
      color: 'danger',
      header: 'Aviso!',
      cssClass: 'textoast',
    });

    await toast.present();
  }
 
}
