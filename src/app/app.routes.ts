import { Routes } from '@angular/router';
import { environment } from '../environments/environment';
import { canActivate } from './login/services/auth.guard';
import { LoginComponent } from './login/login.component';

const defaultRoute = environment.bypassAuth ? 'create' : 'login';
const loginRoute: Routes = environment.bypassAuth 
  ? [{ path: 'login', redirectTo: 'create', pathMatch: 'full' }] 
  : [{ path: 'login', component: LoginComponent }];

export const routes: Routes = [
  { path: '', redirectTo: defaultRoute, pathMatch: 'full' },
  ...loginRoute,
  { path: 'reset-password', loadComponent: () => import('./login/reset-password/reset-password.component').then(m => m.ResetPasswordComponent) },
  { path: 'dashboard', redirectTo: '', pathMatch: 'full' },
  { 
    path: '', 
    loadComponent: () => import('./layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [canActivate],
    children: [
      { path: '', redirectTo: 'create', pathMatch: 'full' },
      { path: 'create', loadComponent: () => import('./features/create/create.component').then(m => m.CreateComponent) },
      { path: 'all', loadComponent: () => import('./features/all/all.component').then(m => m.AllComponent) },
      { path: 'edit/:id', loadComponent: () => import('./features/edit/edit.component').then(m => m.EditComponent) },
    ]
  },
  { path: '**', redirectTo: defaultRoute }
];
