
import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/usuarios.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  userName: string | null = null;
  userRole: string | null = null;

  constructor(private userService: UserService, private router: Router) { }

  ngOnInit() {
    this.userRole = localStorage.getItem('userRole');
    this.userName = localStorage.getItem('userName');
  }

  capitalize(name: string | null): string | null {
    if (!name) return null;
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  }
}
