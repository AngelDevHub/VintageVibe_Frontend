import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-about',
  imports: [CommonModule, RouterLink, ButtonModule, CardModule, TagModule],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent {
  team = [
    { name: 'Sofia Ramirez', role: 'Fundadora y directora creativa', bio: 'Define la mirada editorial de la tienda y selecciona piezas con caracter, historia y presencia.', icon: 'pi pi-palette' },
    { name: 'Carlos Mendoza', role: 'Operaciones y logistica', bio: 'Asegura que cada pedido salga a tiempo, bien cuidado y con una experiencia de compra impecable.', icon: 'pi pi-truck' },
    { name: 'Valentina Cruz', role: 'Curaduria de coleccion', bio: 'Investiga, restaura y combina hallazgos para construir colecciones coherentes y deseables.', icon: 'pi pi-star' },
    { name: 'Diego Torres', role: 'Atencion al cliente', bio: 'Acompana cada compra con seguimiento cercano, respuestas claras y trato humano.', icon: 'pi pi-heart' }
  ];

  values = [
    { title: 'Sostenibilidad', desc: 'Extendemos la vida de prendas valiosas y apostamos por una moda con menor impacto.', icon: 'pi pi-refresh' },
    { title: 'Autenticidad', desc: 'Cada articulo se revisa para cuidar materiales, acabados y coherencia con su epoca.', icon: 'pi pi-verified' },
    { title: 'Curaduria', desc: 'No acumulamos prendas; construimos una seleccion con estilo, equilibrio y personalidad.', icon: 'pi pi-sparkles' },
    { title: 'Calidad', desc: 'Solo llega a la tienda lo que realmente vale la pena usar, regalar o coleccionar.', icon: 'pi pi-check-circle' }
  ];
}
