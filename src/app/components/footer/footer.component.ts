import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-footer',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
  newsletterEmail = signal('');
  newsletterStatus = signal<'idle' | 'success' | 'error' | 'loading'>('idle');

  socialLinks = [
    { name: 'Instagram', url: 'https://www.instagram.com/vintagevibe/', icon: 'instagram', label: 'Instagram' },
    { name: 'Facebook',  url: 'https://www.facebook.com/vintagevibe/',  icon: 'facebook',  label: 'Facebook'  },
    { name: 'Pinterest', url: 'https://www.pinterest.com/vintagevibe/', icon: 'pinterest', label: 'Pinterest' },
    { name: 'TikTok',   url: 'https://www.tiktok.com/@vintagevibe',   icon: 'tiktok',   label: 'TikTok'    }
  ];

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

  subscribeNewsletter(email: string): void {
    if (!email || !this.isValidEmail(email)) {
      this.newsletterStatus.set('error');
      return;
    }
    this.newsletterStatus.set('loading');
    setTimeout(() => {
      this.newsletterStatus.set('success');
      this.newsletterEmail.set('');
      setTimeout(() => this.newsletterStatus.set('idle'), 4000);
    }, 800);
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
