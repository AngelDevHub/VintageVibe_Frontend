import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'shop',
    loadComponent: () => import('./pages/shop/shop.component').then(m => m.ShopComponent)
  },
  {
    path: 'product/:id',
    loadComponent: () => import('./pages/product-detail/product-detail.component').then(m => m.ProductDetailComponent)
  },
  {
    path: 'cart',
    loadComponent: () => import('./pages/cart/cart.component').then(m => m.CartComponent),
    canActivate: [authGuard]
  },
  {
    path: 'checkout',
    loadComponent: () => import('./pages/checkout/checkout.component').then(m => m.CheckoutComponent),
    canActivate: [authGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard]
  },
  {
    path: 'terms-of-use',
    loadComponent: () => import('./pages/terms-of-use/terms-of-use.component').then(m => m.TermsOfUseComponent)
  },
  {
    path: 'about',
    loadComponent: () => import('./pages/about/about.component').then(m => m.AboutComponent)
  },
  {
    path: 'contact',
    loadComponent: () => import('./pages/contact/contact.component').then(m => m.ContactComponent)
  },
  {
    path: 'privacy',
    loadComponent: () => import('./pages/privacy/privacy.component').then(m => m.PrivacyComponent)
  },
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/admin-shell/admin-shell.component').then(m => m.AdminShellComponent),
    canActivate: [adminGuard],
    children: [
      { path: '', loadComponent: () => import('./pages/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent) },
      { path: 'products', loadComponent: () => import('./pages/admin/products/admin-products.component').then(m => m.AdminProductsComponent) },
      { path: 'orders', loadComponent: () => import('./pages/admin/orders/admin-orders.component').then(m => m.AdminOrdersComponent) },
      { path: 'users', loadComponent: () => import('./pages/admin/users/admin-users.component').then(m => m.AdminUsersComponent) },
      { path: 'payments', loadComponent: () => import('./pages/admin/payments/admin-payments.component').then(m => m.AdminPaymentsComponent) },
      { path: 'coupons', loadComponent: () => import('./pages/admin/coupons/admin-coupons.component').then(m => m.AdminCouponsComponent) },
      { path: 'reviews', loadComponent: () => import('./pages/admin/reviews/admin-reviews.component').then(m => m.AdminReviewsComponent) },
      { path: 'catalog', loadComponent: () => import('./pages/admin/catalog/admin-catalog.component').then(m => m.AdminCatalogComponent) }
    ]
  },
  {
    path: 'design-doc',
    loadComponent: () => import('./pages/design-doc/design-doc.component').then(m => m.DesignDocComponent)
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];

