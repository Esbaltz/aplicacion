import { Component, OnInit } from '@angular/core';
import { Clases } from 'src/app/interfaces/iusuario';
import { FireStoreService } from 'src/app/services/firestore.service';
import { sesionService } from 'src/app/services/sesion.service';
import { LocaldbService } from 'src/app/services/localdb.service';
import { Router } from '@angular/router';
import { NetworkService } from 'src/app/services/network.service';

@Component({
  selector: 'app-cursos',
  templateUrl: './cursos.page.html',
  styleUrls: ['./cursos.page.scss'],
})
export class CursosPage implements OnInit {
  cursosProfe: Clases[] = [];
  userId: any;
  rol = this.sesion.getUser()?.rol;

  constructor(
    private sesion: sesionService,
    private firestoreService: FireStoreService,
    private db: LocaldbService,
    private router: Router,
    private networkService: NetworkService
  ) {
    this.userId = this.sesion.getUser()?.id_usuario; 
  }

  async ngOnInit() {
    
    if (this.rol === 'Alumno') {
      // Si el rol es 'Alumno', redirige a cursos-alumno
      this.router.navigate(['/tabs/cursos-alumno']);
    }

    if (this.networkService.isConnected()) {
      console.log('Tienes conexión a Internet.');
      await this.CargarCursosDeFirestore(); // Cargar cursos desde Firebase
      if (this.cursosProfe.length > 1 ) {
        await this.GuardarCursosLocal(this.cursosProfe); // Guardar cursos si existen
      } else {
        console.log('No hay cursos para guardar');
        await this.CargarCursosDeLocal();
        console.log('Cursos que se visualizan',this.cursosProfe)
      }
    } else {
      console.log('No hay conexión a Internet.')
      this.CargarCursosDeLocal(); // Cargar cursos desde almacenamiento local
    }
  }
  
  CargarCursosDeFirestore() {
    this.firestoreService.getCollectionChanges<{ id_docente: string, id_clase: string }>('Clases')
      .subscribe(ClasesIns => {
        if (ClasesIns) {
          const ClasesUsuario = ClasesIns.filter(c => c.id_docente === this.userId);
          const ClasesIds = ClasesUsuario.map(c => c.id_clase);
  
          this.firestoreService.getCollectionChanges<Clases>('Clases').subscribe(data => {
            if (data) {
              this.cursosProfe = data.filter(curso => ClasesIds.includes(curso.id_clase));
            
            }

            if (this.cursosProfe.length > 1) {
              this.GuardarCursosLocal(this.cursosProfe);
            } else {
              console.log('No hay cursos para guardar');
            }
          });
        }
      });
  }

  async GuardarCursosLocal(cursosProfe: Clases[]) {
    try {
      // Guardar los cursos en localStorage
      localStorage.setItem('cursosProfe', JSON.stringify(cursosProfe));
      this.db.guardar('cursosProfe',cursosProfe)
      console.log('Cursos guardados en el local');
    } catch (error) {
      console.error('Error guardando los cursos en local:', error);
    }
  }

  async CargarCursosDeLocal() {
    // Intentar cargar los cursos de Localdb
    const cursosGuardados = await this.db.getData('cursosProfe');
    console.log('Cursos guardados desde Localdb:', cursosGuardados);
  
    if (cursosGuardados && cursosGuardados.length > 0) {
      console.log('Se cargaron los cursos desde Localdb');
      this.cursosProfe = cursosGuardados;
    } else {
      // Si no se encontraron, intentar cargar desde localStorage
      const cursosDesdeStorage = JSON.parse(localStorage.getItem('cursosProfe') || '[]');
      console.log('Cursos cargados desde localStorage:', cursosDesdeStorage);
      this.cursosProfe = cursosDesdeStorage;
    }
  }
  

  DetalleCurso(clases: Clases) {
    if (clases === null) {
      console.log('Id clase no encontrado');
    } else {
      this.router.navigate(['/detalle-clase', clases.id_clase]);
      
    }
  }
}
