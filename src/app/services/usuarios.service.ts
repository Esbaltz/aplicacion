import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor() { }

  get userName(): string | null {
    return localStorage.getItem('userName');
  }

  clearUserName() {
    localStorage.removeItem('userName');
  }
}



