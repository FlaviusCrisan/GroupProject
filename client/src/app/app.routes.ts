import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { PostGame } from './pages/post-game/post-game';
import { PostPage } from './pages/post-page/post-page';

export const routes: Routes = [
	{path: '', component: Login},
	{path: 'home', component: Home},
	{path: 'post-game', component: PostGame},
	{path: 'post/:id', component: PostPage},
];
