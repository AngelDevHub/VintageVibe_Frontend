import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  isMenuOpen = signal(false);
  
  toggleMenu() {
    this.isMenuOpen.update(value => !value);
  }
  
  closeMenu() {
    this.isMenuOpen.set(false);
  }
}
