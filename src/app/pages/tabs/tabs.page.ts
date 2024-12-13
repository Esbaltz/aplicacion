import { Component, OnInit } from '@angular/core';
import { sesionService } from 'src/app/services/sesion.service';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
})
export class TabsPage implements OnInit {

  userRole: string | null = null; 
  rol = this.sesion.getUser()?.rol;

  constructor(private sesion : sesionService) { }

  ngOnInit() {
  }

}
