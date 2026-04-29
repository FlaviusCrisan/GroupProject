import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { PostGame } from './pages/post-game/post-game';
import { PostPage } from './pages/post-page/post-page';
import { ProfilePage } from './pages/profile-page/profile-page';
import { History } from './pages/history/history';
import { DmsPage } from './pages/dms-page/dms-page';
import { Chats } from './pages/chats/chats';
import { Layout } from './components/layout/layout';
import { authGuard } from './guards/auth/auth-guard';

export const routes: Routes = [
	{
		path: '', 
		component: Login
	},
	{
		path: '',
		component: Layout,
		canActivate: [authGuard],
		children: [
			{path: 'home', component: Home},
			{path: 'post-game', component: PostGame},
			{path: 'history', component: History},
			{path: 'chats', component: Chats},
			{path: 'user/:id', component: ProfilePage},
			{path: 'user/:id/dms', component: DmsPage},
			{path: 'post/:id', component: PostPage},
		],
	}
];
