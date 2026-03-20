import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common'; // Modified import
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { CategoryService } from '../../core/services/category.service';
import { Category } from '../../core/models';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterLink, RouterLinkActive, NgOptimizedImage], // Added NgOptimizedImage
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  private router = inject(Router);
  authService = inject(AuthService);
  cartService = inject(CartService);
  private categoryService = inject(CategoryService);

  categories = signal<Category[]>([]);
  isMenuOpen = signal(false);
  isSearchOpen = signal(false);

  ngOnInit() {
  }
  
  toggleMenu() {
    this.isMenuOpen.update(value => !value);
    if (this.isMenuOpen()) {
      this.isSearchOpen.set(false);
    }
  }
  
  closeMenu() {
    this.isMenuOpen.set(false);
  }

  toggleSearch() {
    this.isSearchOpen.update(value => !value);
    if (this.isSearchOpen()) {
      this.isMenuOpen.set(false);
    }
  }

  handleSearch(term: string) {
    if (term.trim()) {
      this.router.navigate(['/shop'], { queryParams: { search: term } });
      this.isSearchOpen.set(false);
    }
  }

  logout() {
    this.authService.logout();
    this.closeMenu();
  }
}
