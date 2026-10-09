import { Component, ChangeDetectorRef, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { PostComponent } from '../../components/post/post';
import { PostInfoSelectors } from '../../components/post-info-selectors/post-info-selectors';
import { Post } from '../../Post';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-post-list',
  imports: [PostInfoSelectors, CommonModule, RouterLink, PostComponent, MatSnackBarModule],
  templateUrl: './post-list.html',
  styleUrl: './post-list.css',
})
export class PostList implements OnChanges {
  @Input() filter_user_id?: string;
  @Input() show_filters?: boolean;
  @Input() current_user_joined?: boolean;

  posts: Post[] = [];
  filters: Record<string, string> = {};
  loading = true;
  error = false;
  private requestVersion = 0;

  constructor(
    private api: ApiService,
    private cd: ChangeDetectorRef,
    private router: Router,
    private snack: MatSnackBar,
  ) {}

  async ngOnChanges() {
    if (this.filter_user_id) this.filters['user'] = this.filter_user_id;

    await this.load_posts();
  }

  async on_filters_changed(filters: Record<string, string>) {
    this.filters = { ...filters, ...(this.filter_user_id ? { user: this.filter_user_id } : {}) };
    await this.load_posts();
  }

  async load_posts() {
    const version = ++this.requestVersion;
    this.loading = true;
    this.error = false;
    try {
      const posts =
        this.current_user_joined === undefined
          ? await this.api.get_games(this.filters)
          : await this.api.get_user_requests(this.current_user_joined);
      if (version === this.requestVersion) this.posts = posts;
    } catch {
      if (version === this.requestVersion) this.error = true;
    } finally {
      if (version === this.requestVersion) {
        this.loading = false;
        this.cd.detectChanges();
      }
    }
  }

  async view(post: Post) {
    this.router.navigate(['/post', post.id]);
  }

  async cancel(post: Post) {
    await this.api.cancel_request(post.id);
    this.posts = this.posts.filter((item) => item.id !== post.id);
    this.snack.open('Request cancelled', 'Close', { duration: 2500 });
    this.cd.detectChanges();
  }
}
