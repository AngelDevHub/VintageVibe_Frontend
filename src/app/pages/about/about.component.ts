import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-about',
  imports: [CommonModule, RouterLink],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent {
  team = [
    { name: 'Sofía Ramírez', role: 'Fundadora & CEO', emoji: '👩‍💼', bio: 'Apasionada de la moda vintage con más de 10 años seleccionando piezas únicas.' },
    { name: 'Carlos Mendoza', role: 'Director de Operaciones', emoji: '👨‍💻', bio: 'Experto en logística y comercio electrónico, garantiza que cada pedido llegue perfecto.' },
    { name: 'Valentina Cruz', role: 'Curadora de Moda', emoji: '👗', bio: 'Su ojo experto selecciona solo las piezas más auténticas y de mayor calidad.' },
    { name: 'Diego Torres', role: 'Atención al Cliente', emoji: '🤝', bio: 'Dedicado a que cada cliente tenga la mejor experiencia de compra posible.' }
  ];

  values = [
    { icon: '♻️', title: 'Sostenibilidad', desc: 'Creemos en la moda circular. Cada pieza vintage que compras ayuda al planeta.' },
    { icon: '✨', title: 'Autenticidad', desc: 'Cada artículo es verificado y autenticado por nuestros expertos.' },
    { icon: '❤️', title: 'Comunidad', desc: 'Más que una tienda, somos una comunidad de amantes de lo vintage.' },
    { icon: '🎯', title: 'Calidad', desc: 'Solo vendemos lo que nosotros mismos usaríamos. Sin excepciones.' }
  ];
}
