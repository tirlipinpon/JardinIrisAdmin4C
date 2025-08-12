import { Routes } from '@angular/router';
import { canActivate } from './login/services/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./login/login.component').then(m => m.LoginComponent) },
  { path: 'dashboard', redirectTo: '', pathMatch: 'full' },
  { 
    path: '', 
    loadComponent: () => import('./layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [canActivate],
    children: [
      { path: '', redirectTo: 'create', pathMatch: 'full' },
      { path: 'create', loadComponent: () => import('./features/create/component/create.component').then(m => m.CreateComponent) },
      { path: 'all', loadComponent: () => import('./features/all/all.component').then(m => m.AllComponent) },
      { path: 'edit/:id', loadComponent: () => import('./features/edit/edit.component').then(m => m.EditComponent) },
    ]
  },
  { path: '**', redirectTo: 'login' }
];
