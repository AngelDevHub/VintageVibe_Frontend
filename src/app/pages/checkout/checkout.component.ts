import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { AddressService } from '../../core/services/address.service';
import { CartService } from '../../core/services/cart.service';
import { PaymentMethodService } from '../../core/services/payment-method.service';
import { Address, Order, PaymentMethod } from '../../core/models';

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  private orderService = inject(OrderService);
  private addressService = inject(AddressService);
  private cartService = inject(CartService);
  private pmService = inject(PaymentMethodService);
  private router = inject(Router);

  cart = this.cartService.cart;
  addresses = signal<Address[]>([]);
  paymentMethods = signal<PaymentMethod[]>([]);
  selectedAddressId = signal<number | null>(null);
  isPlacingOrder = signal(false);
  isSavingAddress = signal(false);
  orderSuccess = signal<Order | null>(null);
  errorMessage = signal('');
  couponCode = '';
  paymentMethod = signal('CARD'); // Default

  newAddress: Partial<Address> = {
    fullName: '', addressLine1: '', addressLine2: '',
    city: '', state: '', postalCode: '', country: '', phoneNumber: '',
    addressType: 'SHIPPING', isDefault: false
  };

  ngOnInit() {
    this.cartService.getCart().subscribe();
    this.pmService.getAll().subscribe((methods) => {
      this.paymentMethods.set(methods);
      if (methods.length > 0) {
        this.paymentMethod.set(methods[0].name); // Default to first method
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

  saveAddress() {
    if (!this.newAddress.fullName || !this.newAddress.addressLine1 || !this.newAddress.city) {
      this.errorMessage.set('Por favor completa los campos requeridos de la dirección');
      return;
    }

    this.isSavingAddress.set(true);
    this.errorMessage.set('');

    this.addressService.create(this.newAddress).subscribe({
      next: (addr: Address) => {
        this.addresses.update((addrs: Address[]) => [...addrs, addr]);
        this.selectedAddressId.set(addr.id);
        this.isSavingAddress.set(false);
        this.newAddress = { fullName: '', addressLine1: '', city: '', state: '', postalCode: '', country: '', phoneNumber: '', addressType: 'SHIPPING', isDefault: false };
      },
      error: () => {
        this.isSavingAddress.set(false);
        this.errorMessage.set('Error al guardar la dirección');
      }
    });
  }

  placeOrder() {
    if (!this.selectedAddressId()) return;

    this.isPlacingOrder.set(true);
    this.errorMessage.set('');

    this.orderService.checkout({
      addressId: this.selectedAddressId()!,
      couponCode: this.couponCode || undefined,
      paymentMethod: this.paymentMethod()
    }).subscribe({
      next: (order: Order) => {
        this.isPlacingOrder.set(false);
        this.orderSuccess.set(order);
        this.cartService.clearLocalCart();
      },
      error: (err: any) => {
        this.isPlacingOrder.set(false);
        this.errorMessage.set(err.error?.message || 'Error al procesar el pedido');
      }
    });
  }
}
