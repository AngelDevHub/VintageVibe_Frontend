import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { AddressService } from '../../core/services/address.service';
import { CartService } from '../../core/services/cart.service';
import { PaymentMethodService } from '../../core/services/payment-method.service';
import { Address, Order, PaymentMethod } from '../../core/models';

export interface CardForm {
  number: string;
  name: string;
  expiry: string;
  cvv: string;
}

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  private orderService = inject(OrderService);
  private addressService = inject(AddressService);
  private cartService = inject(CartService);
  private pmService = inject(PaymentMethodService);

  cart = this.cartService.cart;
  addresses = signal<Address[]>([]);
  paymentMethods = signal<PaymentMethod[]>([]);
  selectedAddressId = signal<number | null>(null);
  isPlacingOrder = signal(false);
  isSavingAddress = signal(false);
  orderSuccess = signal<Order | null>(null);
  errorMessage = signal('');
  couponCode = '';

  // ✅ FIX: selectedPaymentMethod guarda el nombre EXACTO de la BD
  // (CREDIT_CARD, DEBIT_CARD, PAYPAL, BANK_TRANSFER, CASH_ON_DELIVERY)
  selectedPaymentMethod = signal<string>('');

  // Computed helpers para la UI
  isCardPayment = computed(() =>
    this.selectedPaymentMethod() === 'CREDIT_CARD' ||
    this.selectedPaymentMethod() === 'DEBIT_CARD'
  );
  isBankTransfer = computed(() => this.selectedPaymentMethod() === 'BANK_TRANSFER');
  isPayPal = computed(() => this.selectedPaymentMethod() === 'PAYPAL');
  isCashOnDelivery = computed(() => this.selectedPaymentMethod() === 'CASH_ON_DELIVERY');

  // Formulario de tarjeta (simulado)
  cardForm: CardForm = { number: '', name: '', expiry: '', cvv: '' };
  cardError = signal('');

  private fb = inject(FormBuilder);

  addressForm = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.maxLength(100), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
    addressLine1: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s,.-]+$/)]],
    addressLine2: ['', Validators.pattern(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s,.-]*$/)],
    city: ['', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
    state: ['', Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/)],
    postalCode: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
    country: ['', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
    phoneNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
    addressType: ['SHIPPING'],
    isDefault: [false]
  });

  paymentIcons: Record<string, string> = {
    CREDIT_CARD: '💳',
    DEBIT_CARD: '🏧',
    PAYPAL: '🅿️',
    BANK_TRANSFER: '🏦',
    CASH_ON_DELIVERY: '💵'
  };

  paymentLabels: Record<string, string> = {
    CREDIT_CARD: 'Tarjeta de Crédito',
    DEBIT_CARD: 'Tarjeta de Débito',
    PAYPAL: 'PayPal',
    BANK_TRANSFER: 'Transferencia Bancaria',
    CASH_ON_DELIVERY: 'Pago en Efectivo'
  };

  ngOnInit() {
    this.cartService.getCart().subscribe();

    this.pmService.getAll().subscribe({
      next: (methods: PaymentMethod[]) => {
        this.paymentMethods.set(methods);
        if (methods.length > 0) {
          // ✅ FIX: Usar el nombre EXACTO del método (name del DTO), no un alias
          this.selectedPaymentMethod.set(methods[0].name);
        }
      },
      error: () => {
        // Fallback si la API falla
        const fallback: PaymentMethod[] = [
          { id: 1, name: 'CREDIT_CARD' },
          { id: 2, name: 'DEBIT_CARD' },
          { id: 3, name: 'PAYPAL' },
          { id: 4, name: 'BANK_TRANSFER' },
          { id: 5, name: 'CASH_ON_DELIVERY' }
        ] as PaymentMethod[];
        this.paymentMethods.set(fallback);
        this.selectedPaymentMethod.set('CREDIT_CARD');
      }
    });

    this.addressService.getMyAddresses().subscribe({
      next: (addrs: Address[]) => {
        this.addresses.set(addrs);
        if (addrs.length > 0) {
          const defaultAddr = addrs.find((a: Address) => a.isDefault) || addrs[0];
          this.selectedAddressId.set(defaultAddr.id);
        }
      }
    });
  }

  getPaymentIcon(name: string): string {
    return this.paymentIcons[name] || '💰';
  }

  getPaymentLabel(name: string): string {
    return this.paymentLabels[name] || name;
  }

  saveAddress() {
    if (this.addressForm.invalid) {
      this.addressForm.markAllAsTouched();
      this.errorMessage.set('Por favor completa todos los campos obligatorios y corrige los errores de formato.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    this.isSavingAddress.set(true);
    this.errorMessage.set('');
    this.addressService.create(this.addressForm.getRawValue() as Address).subscribe({
      next: (addr: Address) => {
        this.addresses.update((addrs: Address[]) => [...addrs, addr]);
        this.selectedAddressId.set(addr.id);
        this.isSavingAddress.set(false);
        this.addressForm.reset({ addressType: 'SHIPPING', isDefault: false });
      },
      error: (err: any) => {
        this.isSavingAddress.set(false);
        if (err.status === 400 && err.error && typeof err.error === 'object') {
          // Backend field errors mapping
          Object.keys(err.error).forEach(key => {
            const control = this.addressForm.get(key);
            if (control) {
              control.setErrors({ serverError: err.error[key] });
              control.markAsTouched();
            }
          });
          this.errorMessage.set('Existen errores en el formulario, revisa los campos señalados debajo.');
        } else {
          this.errorMessage.set('Error al guardar la dirección');
        }
      }
    });
  }

  private validateCardForm(): boolean {
    const digits = this.cardForm.number.replace(/\s/g, '');
    if (!digits || digits.length < 13) {
      this.cardError.set('Número de tarjeta inválido (mínimo 13 dígitos)');
      return false;
    }
    if (!this.cardForm.name.trim()) {
      this.cardError.set('Ingresa el nombre del titular');
      return false;
    }
    if (!this.cardForm.expiry || !/^\d{2}\/\d{2}$/.test(this.cardForm.expiry)) {
      this.cardError.set('Ingresa la fecha de vencimiento (MM/AA)');
      return false;
    }
    if (!this.cardForm.cvv || this.cardForm.cvv.length < 3) {
      this.cardError.set('CVV inválido');
      return false;
    }
    this.cardError.set('');
    return true;
  }

  formatCardNumber(event: Event) {
    const input = event.target as HTMLInputElement;
    let val = input.value.replace(/\D/g, '').substring(0, 16);
    val = val.replace(/(.{4})/g, '$1 ').trim();
    this.cardForm.number = val;
    input.value = val;
  }

  formatExpiry(event: Event) {
    const input = event.target as HTMLInputElement;
    let val = input.value.replace(/\D/g, '').substring(0, 4);
    if (val.length >= 2) val = val.substring(0, 2) + '/' + val.substring(2);
    this.cardForm.expiry = val;
    input.value = val;
  }

  placeOrder() {
    if (!this.selectedAddressId()) {
      this.errorMessage.set('Selecciona una dirección de envío');
      return;
    }
    if (!this.selectedPaymentMethod()) {
      this.errorMessage.set('Selecciona un método de pago');
      return;
    }
    if (this.isCardPayment() && !this.validateCardForm()) {
      return;
    }

    this.isPlacingOrder.set(true);
    this.errorMessage.set('');

    // ✅ FIX: Enviamos el name exacto de la BD
    this.orderService.checkout({
      addressId: this.selectedAddressId()!,
      couponCode: this.couponCode || undefined,
      paymentMethod: this.selectedPaymentMethod()
    }).subscribe({
      next: (order: Order) => {
        this.isPlacingOrder.set(false);
        this.orderSuccess.set(order);
        this.cartService.clearLocalCart();
      },
      error: (err: any) => {
        this.isPlacingOrder.set(false);
        const msg = err.error?.message || err.error?.error || 'Error al procesar el pedido. Intenta de nuevo.';
        this.errorMessage.set(msg);
      }
    });
  }
}
