import { Routes } from '@angular/router';
import { ProductList } from './components/product-list/product-list';
import { ProductDetail } from './components/product-detail/product-detail';
import { Cart } from './components/cart/cart';
import { Login } from './components/login/login';
import { Register } from './components/register/register';
import { AdminDashboard } from './components/admin-dashboard/admin-dashboard';
import { authGuard } from './guards/auth-guard';
import { adminGuard } from './guards/admin-guard';

export const routes: Routes = [
  { path: '',            component: ProductList },
  { path: 'product/:id', component: ProductDetail },
  { path: 'cart',        component: Cart,          canActivate: [authGuard] },
  { path: 'login',       component: Login },
  { path: 'register',    component: Register },
  { path: 'admin',       component: AdminDashboard, canActivate: [adminGuard] },
  { path: '**',          redirectTo: '' }
];