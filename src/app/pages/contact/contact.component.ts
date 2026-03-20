import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-contact',
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent {
  formStatus = signal<'idle' | 'loading' | 'success' | 'error'>('idle');

  contactInfo = [
    { icon: '📧', label: 'Email', value: 'hola@vintagevibe.com', href: 'mailto:hola@vintagevibe.com' },
    { icon: '📞', label: 'Teléfono', value: '+52 55 1234 5678', href: 'tel:+525512345678' },
    { icon: '📍', label: 'Dirección', value: 'Ciudad de México, CDMX, México', href: null },
    { icon: '⏰', label: 'Horario', value: 'Lun–Vie: 9am–6pm EST', href: null }
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
