import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { PostGame } from './pages/post-game/post-game';
import { PostPage } from './pages/post-page/post-page';
import { ProfilePage } from './pages/profile-page/profile-page';
import { authGuard } from './guards/auth/auth-guard';

export const routes: Routes = [
	{path: '', component: Login},
	{
		path: '',
		canActivate: [authGuard],
		children: [
			{path: 'home', component: Home},
			{path: 'post-game', component: PostGame},
			{path: 'user/:id', component: ProfilePage},
			{path: 'post/:id', component: PostPage},
		],
	}
];
