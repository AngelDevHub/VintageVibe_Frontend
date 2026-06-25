import { Component, OnInit, inject, signal, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { Product, Category, PageResponse } from '../../core/models';

interface SeasonalCampaign {
  id: string;
  name: string;
  badge: string;
  title: string;
  highlight: string;
  description: string;
  bannerText: string;
  detailText: string;
  primaryCta: string;
  secondaryCta: string;
  periodLabel: string;
  themeClass: string;
  startMonth: number;
  startDay: number;
  endMonth: number;
  endDay: number;
  isSpecial: boolean;
}

const DEFAULT_CAMPAIGN: SeasonalCampaign = {
  id: 'base',
  name: 'Escaparate VintageVibe',
  badge: 'Curaduria Editorial',
  title: 'Piezas con historia para un',
  highlight: 'estilo inolvidable',
  description: 'Seleccionamos prendas y accesorios con caracter, textura y esencia retro para que encuentres algo autentico en cualquier temporada.',
  bannerText: 'Edicion permanente',
  detailText: 'Nuestro escaparate principal mantiene una linea editorial clasica y se adapta automaticamente cuando llega una fecha especial.',
  primaryCta: 'Explorar coleccion',
  secondaryCta: 'Ver inspiracion',
  periodLabel: 'Disponible todo el año',
  themeClass: 'campaign-default',
  startMonth: 1,
  startDay: 1,
  endMonth: 12,
  endDay: 31,
  isSpecial: false
};

const SEASONAL_CAMPAIGNS: SeasonalCampaign[] = [
  {
    id: 'valentine',
    name: 'Romance Vintage',
    badge: 'Curaduria Romantica',
    title: 'Detalles y looks para una',
    highlight: 'temporada especial',
    description: 'Durante febrero la portada se suaviza con tonos rosados, prendas delicadas y sugerencias pensadas para regalar o celebrar con estilo.',
    bannerText: 'Edicion de temporada',
    detailText: 'Una seleccion con aire romantico, texturas suaves y piezas que funcionan para regalo, cita o un look con encanto retro.',
    primaryCta: 'Ver seleccion romantica',
    secondaryCta: 'Descubrir la propuesta',
    periodLabel: '10 al 16 de febrero',
    themeClass: 'campaign-valentine',
    startMonth: 2,
    startDay: 10,
    endMonth: 2,
    endDay: 16,
    isSpecial: true
  },
  {
    id: 'summer',
    name: 'Verano con Alma Retro',
    badge: 'Edicion de Verano',
    title: 'Prendas ligeras para un',
    highlight: 'verano con estilo',
    description: 'En junio la portada adopta una paleta luminosa para destacar vestidos frescos, camisas con caracter y favoritos pensados para dias soleados.',
    bannerText: 'Curaduria activa',
    detailText: 'Una vitrina de verano con tonos calidos, piezas frescas y una seleccion pensada para paseos, vacaciones y tardes doradas.',
    primaryCta: 'Explorar verano',
    secondaryCta: 'Ver seleccion curada',
    periodLabel: '1 al 30 de junio',
    themeClass: 'campaign-summer',
    startMonth: 6,
    startDay: 1,
    endMonth: 6,
    endDay: 30,
    isSpecial: true
  },
  {
    id: 'halloween',
    name: 'Otoño de Cine',
    badge: 'Edicion Otoñal',
    title: 'Capas, cuero y acentos para un',
    highlight: 'otoño iconico',
    description: 'Cuando llega octubre, la interfaz toma profundidad con tonos intensos y piezas con actitud para noches frescas y estilismos mas dramaticos.',
    bannerText: 'Selección destacada',
    detailText: 'Predominan las chaquetas, texturas oscuras y tonos especiados en una curaduria inspirada en el lado mas clasico del otoño retro.',
    primaryCta: 'Descubrir otoño',
    secondaryCta: 'Ver piezas clave',
    periodLabel: '20 al 31 de octubre',
    themeClass: 'campaign-halloween',
    startMonth: 10,
    startDay: 20,
    endMonth: 10,
    endDay: 31,
    isSpecial: true
  },
  {
    id: 'holidays',
    name: 'Fiestas con Brillo Clasico',
    badge: 'Temporada Festiva',
    title: 'Looks y regalos para cerrar el año con',
    highlight: 'mucho estilo',
    description: 'En diciembre la portada incorpora destellos calidos, acentos dorados y recomendaciones pensadas para reuniones, cenas y regalos memorables.',
    bannerText: 'Especial de temporada',
    detailText: 'Una seleccion festiva con piezas elegantes, tonos calidos y opciones ideales para regalar o celebrar con un aire vintage refinado.',
    primaryCta: 'Ver favoritos de fiesta',
    secondaryCta: 'Explorar ideas de regalo',
    periodLabel: '1 al 31 de diciembre',
    themeClass: 'campaign-holidays',
    startMonth: 12,
    startDay: 1,
    endMonth: 12,
    endDay: 31,
    isSpecial: true
  }
];

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink, FormsModule, ButtonModule, InputTextModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private zone = inject(NgZone);

  featuredProducts = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  isLoading = signal(true);
  newsletterEmail = signal('');
  newsletterStatus = signal<'idle' | 'success' | 'error' | 'loading'>('idle');
  activeCampaign = signal<SeasonalCampaign>(DEFAULT_CAMPAIGN);
  campaignSchedule = SEASONAL_CAMPAIGNS;
  private bc = new BroadcastChannel('vintage_vibe_updates');

  ngOnInit() {
    this.activeCampaign.set(this.getCurrentCampaign(new Date()));
    this.bc.onmessage = (event) => {
      if (event.data?.type === 'DATA_UPDATED') {
        this.zone.run(() => {
          this.loadData();
        });
      }
    };
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);
    // Load featured products (newest)
    this.productService.getAll({ page: 0, size: 4, sort: 'createdAt,desc' }).subscribe({
      next: (response: PageResponse<Product>) => {
        this.featuredProducts.set(response.content);
      }
    });

    // Load categories
    this.categoryService.getAll().subscribe({
      next: (cats: Category[]) => {
        this.categories.set(cats);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  getProductImage(product: Product): string {
    const primary = product.images?.find(img => img.isPrimary);
    return primary?.imageUrl || product.images?.[0]?.imageUrl || 'assets/images/placeholder.png';
  }

  getProductPrice(product: Product): number {
    if (product.variants?.length > 0) {
      return product.variants[0].discountPrice || product.variants[0].price;
    }
    return 0;
  }

  subscribeNewsletter(email: string): void {
    if (!email || !this.isValidEmail(email)) {
      this.newsletterStatus.set('error');
      return;
    }
    this.newsletterStatus.set('loading');
    // Simulated subscription — replace with real API call when newsletter service is available
    setTimeout(() => {
      this.newsletterStatus.set('success');
      this.newsletterEmail.set('');
      setTimeout(() => this.newsletterStatus.set('idle'), 4000);
    }, 800);
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private getCurrentCampaign(today: Date): SeasonalCampaign {
    const currentValue = this.getMonthDayValue(today.getMonth() + 1, today.getDate());
    return SEASONAL_CAMPAIGNS.find((campaign) => {
      const startValue = this.getMonthDayValue(campaign.startMonth, campaign.startDay);
      const endValue = this.getMonthDayValue(campaign.endMonth, campaign.endDay);
      return currentValue >= startValue && currentValue <= endValue;
    }) ?? DEFAULT_CAMPAIGN;
  }

  private getMonthDayValue(month: number, day: number): number {
    return month * 100 + day;
  }
}
