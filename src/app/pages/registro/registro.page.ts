import { Component, OnInit } from '@angular/core';
import { user } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { Usuario } from 'src/app/interfaces/iusuario';
import { FireStoreService } from 'src/app/services/firestore.service';
import { LocaldbService } from 'src/app/services/localdb.service';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
})
export class RegistroPage implements OnInit {

  usr: Usuario = {
    correo: '',
    password: '',
    nombre: '',
    apellido: '',
    rol: '',
    id_usuario: this.firestoreService.createIdDoc()
  }

  passwordPattern = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_(),.?":{}|<>°]).{8,}$/;

  
  cargando : boolean = false

  constructor(private db: LocaldbService,
    private toastController: ToastController,
    private alertController: AlertController,
    private router: Router,
    private firestoreService : FireStoreService) { }

  ngOnInit() {
  }

  // Alerta si el usuario ya existe
  async presentToast(position: 'top' | 'middle' | 'bottom') {
    const toast = await this.toastController.create({
      message: 'El usuario ya existe',
      duration: 1500,
      position: position,
      color: 'danger',
      header: 'Error!',
      cssClass: 'textoast',
    });

    await toast.present();
  }

  obtenerRolPorCorreo(correo: string): string | null {
    if (correo.endsWith("@alumno.cl")) {
        return "Alumno";
    } else if (correo.endsWith("@docente.cl")) {
        return "Docente";
    } else {
        return null; 
    }
  }

  get passwordValid(): boolean {
    return this.passwordPattern.test(this.usr.password);
  }

  registrar() {
    const rol = this.obtenerRolPorCorreo(this.usr.correo);
  
    // Verifica si el correo es el institucional
    if (rol === null) {
      this.CorreoInvalido('top');
      return;
    }
  
    this.usr.rol = rol;  // Asigna el rol al usuario
  
    // Busca el correo en la base de datos
    let buscado = this.db.obtener(this.usr.correo);
  
    buscado.then(async datos => {
      if (this.passwordValid) {
        if (datos === null) {
          this.db.guardar(this.usr.correo, this.usr);
          this.firestoreService.createDocumentID(this.usr, 'Usuarios', this.usr.id_usuario);
    
          // Guarda el rol en LocalStorage después de asignarlo al usuario
          localStorage.setItem('userRole', this.usr.rol);
          this.presentAlert();
        } else {
          this.presentToast('top');
        }
      }
      else {
        this.ContraseñaInvalida('top')
      }
    });
  }

  // Alerta cuando se crea un usuario
  async presentAlert() {
    const alert = await this.alertController.create({
      header: 'Usuario Registrado con Exito!!!',
      subHeader: '',
      message: 'Ahora puedes utilizar la aplicación',
      buttons: [{
        text:'Continuar',
        handler:()=>{
          
          this.router.navigate(['/login']);
        }
      }]
    });

    await alert.present();
  }

  // Alerta cuando se ingrese un correo que no se el institucinal
  async CorreoInvalido(position: 'top' | 'middle' | 'bottom') {
    const toast = await this.toastController.create({
      message: 'Correo institucinal invalido',
      duration: 1500,
      position: position,
      color: 'danger',
      header: 'Error!',
      cssClass: 'textoast',
    });

    await toast.present();
  }

  async ContraseñaInvalida(position: 'top' | 'middle' | 'bottom') {
    const toast = await this.toastController.create({
      message: 'Cotraseña invalida',
      duration: 1500,
      position: position,
      color: 'danger',
      header: 'Error!',
      cssClass: 'textoast',
    });

    await toast.present();
  }

}
