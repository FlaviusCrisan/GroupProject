import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { PostGame } from './pages/post-game/post-game';

export const routes: Routes = [
	{path: '', component: Home},
	{path: 'post-game', component: PostGame},
];
