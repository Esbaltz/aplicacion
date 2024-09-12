import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  username: string = '';
  password: string = '';

  constructor(private navCtrl: NavController) { }

  login() {

    this.navCtrl.navigateForward('/home');
  }

  ngOnInit() {
    // Inicialización si es necesario
  }
}
