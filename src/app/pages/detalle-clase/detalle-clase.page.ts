import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Alumno, Clases } from 'src/app/interfaces/iusuario';
import { FireStoreService } from 'src/app/services/firestore.service';
import { sesionService } from 'src/app/services/sesion.service';
import { Usuario } from '../../interfaces/iusuario';
import { LocaldbService } from 'src/app/services/localdb.service';

@Component({
  selector: 'app-detalle-clase',
  templateUrl: './detalle-clase.page.html',
  styleUrls: ['./detalle-clase.page.scss'],
})
export class DetalleClasePage implements OnInit {
  
  usuario : Usuario [] = []
  CursoCargado : Clases = {
    nomb_clase : '',
    descripcion : '',
    semestre : 0,
    alumnos : [],
    id_clase: '',
    id_docente :'',
    estado : '',
    seccion_num : 0,
    seccion_letra : '',
    nomb_docente : ''
  }

  AlumnosCargados : Alumno[]= []
  Idclase : any

  rol : any
  constructor(private firestoreService : FireStoreService , private route: ActivatedRoute , private sesion : sesionService ,private db: LocaldbService) { }

  ngOnInit() { 
    
    this.rol = this.sesion.getUser()?.rol
    const ClaseId = this.route.snapshot.paramMap.get('id');
    console.log("ClaseId recibido: ", ClaseId);  
    if (ClaseId) {
      this.CargarCurso(ClaseId);
    } else {
      console.log("ID de clase no encontrado en la URL.");
    }
    this.cargarUsuarios()
    this.CargarUsuariosDeLocal
  }
  cargarUsuarios(){
    this.firestoreService.getCollectionChanges<Usuario>('Usuarios').subscribe(data =>{
      console.log(data)
      if(data){
        //console.log(this.usuario)
        this.usuario = data
      }
      if (this.usuario.length > 1) {
        this.GuardarUsuariosLocal(this.usuario);
      } else {
        console.log('No hay USUarios para guardar');
      }
    })
  }

  async GuardarUsuariosLocal(usuario: Usuario[]) {
    try {
      // Guardar los usuarios en localStorage
      localStorage.setItem('usuarios', JSON.stringify(usuario));
      this.db.guardar('usuarios',usuario)
      console.log('Usuarios guardados en el local');
    } catch (error) {
      console.error('Error guardando los cursos en local:', error);
    }
  }

  async CargarUsuariosDeLocal() {
    // Intentar cargar los USUARIOS de Localdb
    const usuariosGuardados = await this.db.getData('usuarios');
    console.log('usuarios guardados desde Localdb:', usuariosGuardados);
  
    if (usuariosGuardados && usuariosGuardados.length > 0) {
      console.log('Se cargaron los cursos desde Localdb');
        this.usuario = usuariosGuardados;
    } else {
      // Si no se encontraron, intentar cargar desde localStorage
      const usuariosDesdeStorage = JSON.parse(localStorage.getItem('usuarios') || '[]');
      console.log('Cursos cargados desde localStorage:', usuariosDesdeStorage);
      this.usuario = usuariosDesdeStorage;
    }
  }

  CargarCurso( id_clase :string ){
    this.firestoreService.getDocument<Clases>('Clases', id_clase).subscribe(clase => {
      if (clase) {
        this.CursoCargado = clase;
        console.log('Curso cargado:', this.CursoCargado); 
        this.Idclase = this.CursoCargado.id_clase
        this.AlumnosCargados = this.CursoCargado.alumnos
        console.log('Alumnos de esta clase -> ' , this.AlumnosCargados)
      }
    });
  }

}
