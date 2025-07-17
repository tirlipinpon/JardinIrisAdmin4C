import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./login/login.component').then(m => m.LoginComponent) },
  { 
    path: '', 
    loadComponent: () => import('./layout/layout.component').then(m => m.LayoutComponent),
    children: [
      { path: 'create', loadComponent: () => import('./create/create.component').then(m => m.CreateComponent) },
      { path: 'all', loadComponent: () => import('./all/all.component').then(m => m.AllComponent) },
      { path: 'edit/:id', loadComponent: () => import('./edit/edit.component').then(m => m.EditComponent) },
    ]
  },
  { path: '**', redirectTo: 'login' }
];
