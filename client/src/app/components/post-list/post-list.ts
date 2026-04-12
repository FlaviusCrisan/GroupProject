import { Component, ChangeDetectorRef, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { PostComponent } from '../../components/post/post';
import { PostInfoSelectors } from '../../components/post-info-selectors/post-info-selectors';
import { Post } from '../../Post';

@Component({
  selector: 'app-post-list',
  imports: [PostInfoSelectors, CommonModule, PostComponent],
  templateUrl: './post-list.html',
  styleUrl: './post-list.css',
})
export class PostList implements OnChanges
{
  @Input() filter_user_id?: string;

  posts: Post[] = [];
  filters: Record<string, string> = {};

  constructor(private api: ApiService, private cd: ChangeDetectorRef, private router: Router) {}

  async ngOnChanges()
  {
    if (this.filter_user_id)
      this.filters["user"] = this.filter_user_id;

    await this.load_posts();
  }

  async on_filters_changed(filters: Record<string, string>)
  {
    Object.assign(this.filters, filters);
    await this.load_posts();
  }

  async load_posts()
  {
    this.posts = await this.api.get_games(this.filters);
    this.cd.detectChanges();
  }

  async view(post: Post)
  {
    this.router.navigate(['/post', post.id]);
  }
}
