import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  era: string;
}

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  featuredProducts: Product[] = [
    {
      id: 1,
      name: 'Chaqueta de Cuero Vintage',
      price: 89.99,
      image: '/images/product1.png',
      category: 'Chaquetas',
      era: '1970s'
    },
    {
      id: 2,
      name: 'Vestido Floral Elegante',
      price: 65.00,
      image: '/images/product2.png',
      category: 'Vestidos',
      era: '1960s'
    },
    {
      id: 3,
      name: 'Chaqueta Denim Clásica',
      price: 55.00,
      image: '/images/product3.png',
      category: 'Chaquetas',
      era: '1980s'
    },
    {
      id: 4,
      name: 'Falda de Cuadros Vintage',
      price: 45.00,
      image: '/images/product4.png',
      category: 'Faldas',
      era: '1960s'
    },
    {
      id: 5,
      name: 'Pañuelo de Seda Premium',
      price: 35.00,
      image: '/images/product5.png',
      category: 'Accesorios',
      era: '1950s'
    },
    {
      id: 6,
      name: 'Chaqueta de Cuero Vintage',
      price: 89.99,
      image: '/images/product1.png',
      category: 'Chaquetas',
      era: '1970s'
    }
  ];

  collections = [
    {
      title: 'Años 50',
      description: 'Elegancia clásica',
      image: '🌸'
    },
    {
      title: 'Años 60',
      description: 'Revolución de estilo',
      image: '🎨'
    },
    {
      title: 'Años 70',
      description: 'Bohemio y libre',
      image: '🌼'
    },
    {
      title: 'Años 80',
      description: 'Audaz y vibrante',
      image: '⚡'
    }
  ];
}
