import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { PostGame } from './pages/post-game/post-game';

export const routes: Routes = [
	{path: '', component: Login},
	{path: 'home', component: Home},
	{path: 'post-game', component: PostGame},
];
