import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Clases } from 'src/app/interfaces/iusuario';
import { FireStoreService } from 'src/app/services/firestore.service';
import { LocaldbService } from 'src/app/services/localdb.service';
import { NetworkService } from 'src/app/services/network.service';
import { sesionService } from 'src/app/services/sesion.service';

@Component({
  selector: 'app-asistencia-prof',
  templateUrl: './asistencia-prof.page.html',
  styleUrls: ['./asistencia-prof.page.scss'],
})
export class AsistenciaProfPage implements OnInit {
  cursosProfe: Clases[] = [];
  userId : any
  constructor( private sesion : sesionService , 
    private firestoreService : FireStoreService, 
    private router: Router, 
    private db: LocaldbService ,
    private networkService: NetworkService) { 

    this.userId = this.sesion.getUser()?.id_usuario;
  }

  ngOnInit() {
    if (this.networkService.isConnected()) { 
      this.CargarCursos()
      console.log('USUARIO ID =>',this.userId)
      console.log('Tienes conexión a Internet.');
    }
    else{
      this.CargarCursosDeLocal();
    }
  }
 
  CargarCursos() {
    this.firestoreService.getCollectionChanges<{ id_docente: string, id_clase: string }>('Clases')
      .subscribe(ClasesIns => {
        if (ClasesIns) {
          console.log('ClasesIns =>',ClasesIns)

          const ClasesUsuario = ClasesIns.filter(c => c.id_docente === this.userId);
          console.log('ClasesUsuario', ClasesUsuario)

          const ClasesIds = ClasesUsuario.map(c => c.id_clase);
          console.log('ClasesIds =>',ClasesIds)

          this.firestoreService.getCollectionChanges<Clases>('Clases').subscribe(data => {
            if (data) {
              console.log(data)
              this.cursosProfe = data.filter(curso => ClasesIds.includes(curso.id_clase));
              console.log(this.cursosProfe)
            }
          })
        }
      });
  }


  ListaSesionXclase( clases : Clases){
    console.log('CURSO =>', clases)
    this.router.navigate(['/lista',clases.id_clase] );
    console.log('Se a cargado el curso con el ID =',clases.id_clase)

  }

  async CargarCursosDeLocal() {
    // Intenta cargar los cursos de Localdb primero
    const cursosGuardados = await this.db.obtener('cursosProfe');
    console.log('Cursos guardados desde Localdb:', cursosGuardados);
    if (cursosGuardados) {
      this.cursosProfe = cursosGuardados;
    } else {
      // Si no se encontraron, intenta cargar desde localStorage
      const cursosDesdeStorage = JSON.parse(localStorage.getItem('cursosProfe') || '[]');
      console.log('Cursos guardados desde localStorage:', cursosDesdeStorage);
      this.cursosProfe = cursosDesdeStorage;
    }
  }

}
