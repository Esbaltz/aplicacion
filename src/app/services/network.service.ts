import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {

  constructor() {}

  // Método para verificar si hay conexión a Internet
  isConnected(): boolean {
    return navigator.onLine;
  }
}