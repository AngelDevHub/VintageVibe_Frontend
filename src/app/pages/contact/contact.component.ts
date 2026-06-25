import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'app-contact',
  imports: [CommonModule, FormsModule, ButtonModule, CardModule, InputTextModule, MessageModule, TagModule, TextareaModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent {
  formStatus = signal<'idle' | 'loading' | 'success' | 'error'>('idle');

  contactInfo = [
    { label: 'Email', value: 'hola@vintagevibe.com', href: 'mailto:hola@vintagevibe.com', icon: 'pi pi-envelope' },
    { label: 'Telefono', value: '+52 55 1234 5678', href: 'tel:+525512345678', icon: 'pi pi-phone' },
    { label: 'Direccion', value: 'Ciudad de Mexico, CDMX, Mexico', href: null, icon: 'pi pi-map-marker' },
    { label: 'Horario', value: 'Lun–Vie: 9am–6pm', href: null, icon: 'pi pi-clock' }
  ];

  subjectOptions = [
    { label: 'Consulta sobre un pedido', value: 'order' },
    { label: 'Consulta sobre un producto', value: 'product' },
    { label: 'Devoluciones y cambios', value: 'return' },
    { label: 'Informacion de envio', value: 'shipping' },
    { label: 'Otro tema', value: 'other' }
  ];

  submitForm(form: NgForm): void {
    if (form.invalid) return;
    this.formStatus.set('loading');
    // Simulated form submission
    setTimeout(() => {
      this.formStatus.set('success');
      form.resetForm();
    }, 1000);
  }
}
