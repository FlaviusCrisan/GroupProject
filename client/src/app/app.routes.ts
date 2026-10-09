import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Layout } from './components/layout/layout';
import { authGuard } from './guards/auth/auth-guard';

export const routes: Routes = [
  {
    path: '',
    component: Login,
  },
  {
    path: '',
    component: Layout,
    canActivate: [authGuard],
    children: [
      { path: 'home', loadComponent: () => import('./pages/home/home').then((m) => m.Home) },
      {
        path: 'post-game',
        loadComponent: () => import('./pages/post-game/post-game').then((m) => m.PostGame),
      },
      {
        path: 'history',
        loadComponent: () => import('./pages/history/history').then((m) => m.History),
      },
      { path: 'chats', loadComponent: () => import('./pages/chats/chats').then((m) => m.Chats) },
      {
        path: 'user/:id',
        loadComponent: () => import('./pages/profile-page/profile-page').then((m) => m.ProfilePage),
      },
      {
        path: 'user/:id/dms',
        loadComponent: () => import('./pages/dms-page/dms-page').then((m) => m.DmsPage),
      },
      {
        path: 'post/:id',
        loadComponent: () => import('./pages/post-page/post-page').then((m) => m.PostPage),
      },
    ],
  },
];
