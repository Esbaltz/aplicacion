import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, NavController, ToastController } from '@ionic/angular';
import { Usuario } from 'src/app/interfaces/iusuario';
import { LocaldbService } from 'src/app/services/localdb.service';
import { FireStoreService } from 'src/app/services/firestore.service';
import { NgForm } from '@angular/forms';
import { sesionService } from '../../services/sesion.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  mensaje:string="";
  usr: Usuario = {
    correo: '',
    password: '',
    nombre: '',
    apellido: '',
    rol : '',
    id_usuario :''
  }
  rol = this.sesion.getUser()?.rol;

  showPassword: boolean = false;

  usuario : Usuario[] = [];
  constructor(private db:LocaldbService, 
              public router:Router, 
              private toastController:ToastController ,
              private firestoreService : FireStoreService , 
              public sesion : sesionService , 
              private alertctrl:AlertController
  ) { }

  ngOnInit() {
    this.reloadPage();
    if (this.sesion.isLoggedIn()) {
      // this.router.navigate(['/perfil']);
    } else {
      this.cargarUsuarios()
    }
  }
  async presentToast(position: 'top' | 'middle' | 'bottom') {
    const toast = await this.toastController.create({
      message: 'El usuario o clave incorrecto',
      duration: 1500,
      position: position,
      color: 'danger',
      header: 'Error!',
      cssClass: 'textoast',
    });

    await toast.present();
  }
  logear(){
    let buscado = this.db.obtener(this.usr.correo)
   
    buscado.then(datos => {
      if (datos !== null) {
        //clg(datos.username)
       if(datos.correo===this.usr.correo && datos.password===this.usr.password){
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');
        
        // Guardar los datos del nuevo usuario
        localStorage.setItem('userRole', datos.rol);
        localStorage.setItem('userName', datos.nombre);

        console.log('El rol del usuario es: ' + this.usr.rol);
        if (this.rol==='Alumno'){
          this.router.navigate(['/tabs/cursos-alumno']);
        } else {
          this.router.navigate(['/tabs/cursos']);
        }
       }

      } else {
        this.presentToast('top');

      }
    });
  }

  Loguear2(form: NgForm){
    if (form.valid) {
      console.log("Form Enviado...");
      if (this.usr.correo && this.usr.password) {
 
        const usuarioEncontrado = this.usuario.find(usr => 
          usr.correo?.trim() === this.usr.correo?.trim() && usr.password?.trim() === this.usr.password?.trim()
        );



        if (usuarioEncontrado) {
          this.sesion.login(usuarioEncontrado);
          //this.router.navigate(['/perfil']);

          console.log('El rol del usuario es: ' + this.usr.rol);
          if (this.rol==='Alumno'){
            this.router.navigate(['/tabs/cursos-alumno']);
          } else {
            this.router.navigate(['/tabs/cursos']);
          }
        } else {
          this.mensaje = "Acceso denegado";
          this.alerta();
        }
      } else {
        this.mensaje = "Complete todos los campos";
      } 
    }
  }

  cargarUsuarios(){
    this.firestoreService.getCollectionChanges<Usuario>('Usuarios').subscribe(data =>{
      console.log(data)
      if(data){
        console.log(this.usuario)
        this.usuario = data
      }
    })
  }

  async alerta(){
    console.log("Alerta desde controller");
    const alert = await this.alertctrl.create({
      header: 'Acceso denegado',
      subHeader: 'usuario y/o password incorrecto',
      message: 'ingrese usuario y/o password validos',
      buttons: [{
        id:'aceptar del alert controller',
        text:'Aceptar',
        cssClass:'color-aceptar',
        handler:()=>{
          console.log(event);
        }
      }],
    });

    await alert.present();
  }

  reloadPage() {
    // Recargar la página al navegar a la misma ruta
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([decodeURI(this.router.url)]);
    });
  }

  Reload() {
    this.router.navigate(['/login']);
    this.SesionCerrada('top')
    location.reload();  // Recarga la página
  }

  async SesionCerrada(position: 'top' | 'middle' | 'bottom') {
    const toast = await this.toastController.create({
      message: 'Has cerrado sesion',
      duration: 1500,
      position: position,
      color: 'primary',
      header: 'Error!',
      cssClass: 'textoast',
    });

    await toast.present();
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

}
