import { Component, OnInit, ChangeDetectorRef, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from '../../services/api.service';
import { PostComponent } from '../../components/post/post';
import { Post } from '../../Post';

@Component({
  selector: 'app-home',
  imports: [PostComponent, CommonModule, RouterModule, MatButtonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class Home implements OnInit
{
  posts: Post[] = [];

  constructor(private api: ApiService, private cd: ChangeDetectorRef, private router: Router) {}

  async ngOnInit() : Promise<void>
  {
    await this.load_posts();
  }

  async load_posts()
  {
    this.posts = await this.api.get_games();
    this.cd.detectChanges();
  }

  async join(post: Post)
  {
    this.router.navigate(['/post', post.id]);
  }
}
