import { Component, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
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
export class PostList
{
  @Output() view_clicked = new EventEmitter<Post>();

  posts: Post[] = [];

  constructor(private api: ApiService, private cd: ChangeDetectorRef) {}

  async load_posts(filters: Record<string, string>)
  {
    this.posts = await this.api.get_games(filters);
    this.cd.detectChanges();
  }
}
