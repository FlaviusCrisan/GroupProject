import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Post, PostInfo } from '../../Post';
import { PostComponent } from '../../components/post/post';
import { MessagingComponent } from '../../components/messaging/messaging';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { GameIcon } from '../../components/game-icon/game-icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { PostInfoSelectors } from '../../components/post-info-selectors/post-info-selectors';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-post-page',
  imports: [
    GameIcon,
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    MatSnackBarModule,
    PostInfoSelectors,
    PostComponent,
    MessagingComponent,
  ],
  templateUrl: './post-page.html',
  styleUrl: './post-page.css',
})
export class PostPage implements OnInit {
  id: number;
  post: Post | undefined;
  edit_info: PostInfo = new PostInfo();
  is_self: boolean = false;
  accepted_is_self: boolean = false;
  requested: boolean = false;
  requests: any[] = [];
  editing: boolean = false;
  refresh: number = 0;
  message?: string;
  loading = true;
  error = '';
  busy = false;

  constructor(
    public api: ApiService,
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef,
    private router: Router,
    private snack: MatSnackBar,
  ) {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
  }

  async ngOnInit() {
    await this.load_post();
  }

  async load_post() {
    this.loading = true;
    this.error = '';
    try {
      this.post = await this.api.get_game(this.id);
      this.edit_info = Object.assign(new PostInfo(), this.post.info);
      const userId = await this.api.get_user_id();
      this.is_self = this.post.user_id === userId;
      this.accepted_is_self = this.post.accepted_user_id === userId;
      if (this.is_self) {
        this.requests = (await this.api.get_requests(this.id)) as any[];
        await Promise.all(
          this.requests.map(async (request) => {
            request.user_info = await this.api.get_user_info(request.clerk_id);
          }),
        );
      } else {
        this.requested = await this.api.has_requested(this.id);
      }
    } catch {
      this.error = 'The lobby may have been removed, or the service is unavailable.';
    } finally {
      this.loading = false;
      this.cd.detectChanges();
    }
  }

  update_edit_info(info: Record<string, string>) {
    this.edit_info = Object.assign(
      new PostInfo(),
      { title: this.edit_info.title, description: this.edit_info.description },
      info,
    );
  }

  async save_post() {
    if (this.busy) return;
    this.busy = true;
    try {
      await this.api.update_game(this.id, this.edit_info);
      this.editing = false;
      this.snack.open('Post updated', 'Close', { duration: 2500 });
      await this.load_post();
      this.refresh++;
      this.cd.detectChanges();
    } catch {
      this.snack.open('The action could not be completed. Please try again.', 'Close', {
        duration: 4000,
      });
    } finally {
      this.busy = false;
      this.cd.detectChanges();
    }
  }

  async delete_post() {
    if (this.busy) return;
    this.busy = true;
    try {
      if (!confirm('Delete this post?')) return;

      await this.api.delete_game(this.id);
      this.snack.open('Post deleted', 'Close', { duration: 2500 });
      this.router.navigate(['/home']);
    } catch {
      this.snack.open('The action could not be completed. Please try again.', 'Close', {
        duration: 4000,
      });
    } finally {
      this.busy = false;
      this.cd.detectChanges();
    }
  }

  async request_to_join() {
    if (this.busy) return;
    this.busy = true;
    try {
      await this.api.request_to_join(this.id);
      this.requested = true;
      this.snack.open('Request sent', 'Close', { duration: 2500 });
      this.cd.detectChanges();
    } catch {
      this.snack.open('The action could not be completed. Please try again.', 'Close', {
        duration: 4000,
      });
    } finally {
      this.busy = false;
      this.cd.detectChanges();
    }
  }

  async cancel_request() {
    if (this.busy) return;
    this.busy = true;
    try {
      await this.api.cancel_request(this.id);
      this.requested = false;
      this.snack.open('Request cancelled', 'Close', { duration: 2500 });
      this.cd.detectChanges();
    } catch {
      this.snack.open('The action could not be completed. Please try again.', 'Close', {
        duration: 4000,
      });
    } finally {
      this.busy = false;
      this.cd.detectChanges();
    }
  }

  async accept(user_id: string) {
    if (this.busy) return;
    this.busy = true;
    try {
      await this.api.accept_request(this.id, user_id);
      if (this.post) this.post.accepted_user_id = user_id;
      this.snack.open('Request accepted', 'Close', { duration: 2500 });
      await this.load_post();
      this.cd.detectChanges();
    } catch {
      this.snack.open('The action could not be completed. Please try again.', 'Close', {
        duration: 4000,
      });
    } finally {
      this.busy = false;
      this.cd.detectChanges();
    }
  }

  async decline(user_id: string) {
    if (this.busy) return;
    this.busy = true;
    try {
      await this.api.decline_request(this.id, user_id);
      this.requests = this.requests.filter((r) => r.clerk_id !== user_id);
      this.snack.open('Request declined', 'Close', { duration: 2500 });
      this.cd.detectChanges();
    } catch {
      this.snack.open('The action could not be completed. Please try again.', 'Close', {
        duration: 4000,
      });
    } finally {
      this.busy = false;
      this.cd.detectChanges();
    }
  }
}
