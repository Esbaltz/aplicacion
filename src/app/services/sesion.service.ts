import { Injectable } from '@angular/core';
import { Clases, Usuario } from '../interfaces/iusuario';

@Injectable({
  providedIn: 'root'
})
export class sesionService {
  private isAuthenticated = false;
  private currentUser: Usuario | null = null;
  private currentClase : Clases | null = null;

  constructor() {
    const user = localStorage.getItem('user');
    if (user) {
      this.currentUser = JSON.parse(user);
      this.isAuthenticated = true;
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
  
  isLoggedIn() {
    return this.isAuthenticated;
  }
}