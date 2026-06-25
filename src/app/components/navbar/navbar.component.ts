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
  isCollectionsMenuOpen = signal(false);

  ngOnInit() {
    this.categoryService.getAll().subscribe({
      next: (categories) => this.categories.set(categories.slice(0, 6)),
      error: () => this.categories.set([])
    });
  }
  
  toggleMenu() {
    this.isMenuOpen.update(value => !value);
    if (this.isMenuOpen()) {
      this.isSearchOpen.set(false);
      this.isCollectionsMenuOpen.set(false);
    }
  }
  
  closeMenu() {
    this.isMenuOpen.set(false);
    this.isCollectionsMenuOpen.set(false);
  }

  toggleSearch() {
    this.isSearchOpen.update(value => !value);
    if (this.isSearchOpen()) {
      this.isMenuOpen.set(false);
      this.isCollectionsMenuOpen.set(false);
    }
  }

  openCollectionsMenu() {
    this.isCollectionsMenuOpen.set(true);
  }

  closeCollectionsMenu() {
    this.isCollectionsMenuOpen.set(false);
  }

  toggleCollectionsMenu(event?: Event) {
    event?.preventDefault();
    this.isCollectionsMenuOpen.update(value => !value);
    if (this.isCollectionsMenuOpen()) {
      this.isMenuOpen.set(false);
      this.isSearchOpen.set(false);
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
