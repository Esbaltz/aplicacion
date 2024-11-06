import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController, ToastController } from '@ionic/angular';
import { Usuario } from 'src/app/interfaces/iusuario';
import { LocaldbService } from 'src/app/services/localdb.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  usr: Usuario = {
    correo: '',
    password: '',
    nombre: '',
    apellido: '',
    rol : '',
    id_usuario : ''
  }
  constructor(private db:LocaldbService, private router:Router, private toastController:ToastController) { }

  ngOnInit() {
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
        this.router.navigate(['/home'])
       }

      } else {
        this.presentToast('top');

      }
    });
  }
}
