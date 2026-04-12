import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { PostList } from '../../components/post-list/post-list';
import { Post } from '../../Post';

@Component({
  selector: 'app-home',
  imports: [PostList, RouterModule, MatButtonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
  schemas: [],
})
export class Home
{
  constructor(private router: Router) {}

  async join(post: Post)
  {
    this.router.navigate(['/post', post.id]);
  }
}
