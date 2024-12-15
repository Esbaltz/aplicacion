import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { sesionService } from 'src/app/services/sesion.service';

@Component({
  selector: 'app-cuenta',
  templateUrl: './cuenta.page.html',
  styleUrls: ['./cuenta.page.scss'],
})
export class CuentaPage implements OnInit {

  rol = this.sesion.getUser()?.rol;
  user = this.sesion.getUser();

  constructor(private router: Router, private sesion : sesionService , ) { }

  ngOnInit() {
    
  }

  cerrarSesion() {
    // Lógica de cierre de sesión (por ejemplo, eliminar token de sesión)
    this.router.navigate(['/login']); // Redirigir a la página de login
    this.sesion.logout()
  }


}
