import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-configuracion',
  templateUrl: './configuracion.page.html',
  styleUrls: ['./configuracion.page.scss'],
})
export class ConfiguracionPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  public alertButtons = ['OK'];
  public alertInputs = [
    {
      type: 'textarea',
      placeholder: 'Describe el error detectado      ',

    },

  ];

}
