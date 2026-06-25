import { Component, OnInit, inject, signal, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
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
  name: 'Escaparate Vintage Permanente',
  badge: 'Seleccion Editorial',
  title: 'Descubre el Encanto',
  highlight: 'del Pasado',
  description: 'Piezas unicas y autenticas de las decadas mas iconicas. Cada prenda cuenta una historia, crea la tuya.',
  bannerText: 'Programacion automatica disponible',
  detailText: 'La portada cambia automaticamente cuando llega una temporada especial del calendario comercial.',
  primaryCta: 'Explorar Tienda',
  secondaryCta: 'Ver documentacion',
  periodLabel: 'Todo el año',
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
    name: 'San Valentin Retro',
    badge: 'Edicion Romantica',
    title: 'Looks con energia',
    highlight: 'romantica',
    description: 'Durante febrero la portada resalta colores suaves, regalos vintage y recomendaciones para citas o detalles especiales.',
    bannerText: 'Evento calendarizado activo',
    detailText: 'Campana automatica para San Valentin con banner tematico y acentos visuales rosados.',
    primaryCta: 'Ver ideas de regalo',
    secondaryCta: 'Consultar evidencias',
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
    name: 'Summer Vintage Fest',
    badge: 'Festival de Verano',
    title: 'Coleccion fresca para un',
    highlight: 'verano retro',
    description: 'En junio y verano temprano la interfaz cambia el fondo y el mensaje principal para destacar prendas ligeras, colores vivos y nuevas colecciones.',
    bannerText: 'Evento calendarizado activo',
    detailText: 'Campana automatica de verano con fondo vibrante, banner superior y CTA orientado a la temporada.',
    primaryCta: 'Descubrir verano',
    secondaryCta: 'Consultar evidencias',
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
    name: 'Halloween Clasico',
    badge: 'Edicion Otono',
    title: 'Texturas oscuras para una',
    highlight: 'temporada iconica',
    description: 'En octubre la portada destaca tonos oscuros, colecciones de cuero y banners inspirados en el estilo retro de Halloween.',
    bannerText: 'Evento calendarizado activo',
    detailText: 'Campana automatica de otono con banner tematico y una portada mas dramatica.',
    primaryCta: 'Ver otono vintage',
    secondaryCta: 'Consultar evidencias',
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
    name: 'Holiday Classics',
    badge: 'Temporada Festiva',
    title: 'Brilla con clasicos de',
    highlight: 'fin de año',
    description: 'En diciembre se activa una version con acentos dorados, mensajes festivos y banners orientados a regalos y celebraciones.',
    bannerText: 'Evento calendarizado activo',
    detailText: 'Campana automatica navidena con fondos calidos y promocion de regalos.',
    primaryCta: 'Explorar regalos',
    secondaryCta: 'Consultar evidencias',
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
  imports: [CommonModule, RouterLink, FormsModule],
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
