import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PostList } from '../../components/post-list/post-list';
import { GameIcon } from '../../components/game-icon/game-icon';

@Component({
  selector: 'app-home',
  imports: [RouterModule, PostList, GameIcon],
  templateUrl: './home.html',
  styleUrl: './home.css',
  schemas: [],
})
export class Home {}
