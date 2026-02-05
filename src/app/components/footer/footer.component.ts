import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {
  currentYear = new Date().getFullYear();

  externalLinks = [
    {
      name: 'Cuidado con el Perro',
      url: 'https://www.cuidadoconelperro.com.mx/',
      description: 'Marca mexicana de moda urbana y accesible.'
    },
    {
      name: 'Vogue México',
      url: 'https://www.vogue.mx/',
      description: 'Noticias de moda, belleza y estilo de vida.'
    },
    {
      name: 'Elle',
      url: 'https://www.elle.com/es/',
      description: 'Tendencias de moda y consejos de estilo.'
    },
    {
      name: 'Pinterest - Moda Vintage',
      url: 'https://www.pinterest.com/search/pins/?q=vintage%20fashion',
      description: 'Inspiración visual para outfits vintage.'
    }
  ];
}
