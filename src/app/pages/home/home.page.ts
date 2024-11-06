import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/usuarios.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  userName: string | null = null;

  constructor(private userService: UserService) { }

  ngOnInit() {
    this.userName = this.capitalize(this.userService.userName);
  }

  capitalize(name: string | null): string | null {
    if (!name) return null;
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  }

}
