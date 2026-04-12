import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { PostList } from '../../components/post-list/post-list';
import { Post } from '../../Post';

@Component({
  selector: 'app-home',
  imports: [RouterModule, PostList, MatButtonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
  schemas: [],
})
export class Home {}
