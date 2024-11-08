import { Injectable } from '@angular/core';
import { Clases, Usuario } from '../interfaces/iusuario';

@Injectable({
  providedIn: 'root'
})
export class sesionService {
  private isAuthenticated = false;
  private currentUser: Usuario | null = null;
  private currentClase: Clases | null = null;

  constructor() {
    const user = localStorage.getItem('user');
    const clase = localStorage.getItem('clases')
    if (user) {
      this.currentUser = JSON.parse(user);
      this.isAuthenticated = true;
    }
    if (clase) {
      this.currentClase = JSON.parse(clase);
    }
  }

  login(user: Usuario) {
    this.isAuthenticated = true;
    this.currentUser = user;
    localStorage.setItem('user', JSON.stringify(user));
  }

  logout() {
    this.isAuthenticated = false;
    this.currentUser = null;
    localStorage.removeItem('user');
  }

  getUser() {
    return this.currentUser;
  }
  
  getClase() {
    return this.currentClase
  }

  isLoggedIn() {
    return this.isAuthenticated;
  }
}