import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Post, PostInfo } from '../../Post';
import { PostComponent } from '../../components/post/post';
import { MessagingComponent } from '../../components/messaging/messaging';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { PostInfoSelectors } from '../../components/post-info-selectors/post-info-selectors';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-post-page',
  imports: [MatIconModule, CommonModule, MatButtonModule, MatCardModule, MatInputModule, MatFormFieldModule, FormsModule, MatSnackBarModule, PostInfoSelectors, PostComponent, MessagingComponent],
  templateUrl: './post-page.html',
  styleUrl: './post-page.css',
})
export class PostPage implements OnInit
{
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

  constructor(public api: ApiService, private route: ActivatedRoute, private cd: ChangeDetectorRef, private router: Router, private snack: MatSnackBar)
  {
    this.id = Number(this.route.snapshot.paramMap.get("id"));
  }

  async ngOnInit()
  {
    await this.load_post();
  }

  async load_post()
  {
    this.post = await this.api.get_game(this.id);
    this.edit_info = Object.assign(new PostInfo(), this.post.info);

    this.is_self = this.post?.user_id === await this.api.get_user_id();
    this.accepted_is_self = this.post.accepted_user_id === await this.api.get_user_id();
    if (this.is_self)
    {
      this.requests = await this.api.get_requests(this.id) as any[];
      for (let i = 0; i < this.requests.length; ++i)
        this.requests[i].user_info = await this.api.get_user_info(this.requests[i].clerk_id);
    }
    else
      this.requested = await this.api.has_requested(this.id);

    this.cd.detectChanges();
  }

  update_edit_info(info: Record<string, string>)
  {
    Object.assign(this.edit_info, info);
  }

  async save_post()
  {
    await this.api.update_game(this.id, this.edit_info);
    this.editing = false;
    this.snack.open("Post updated", "Close", {duration: 2500});
    await this.load_post();
    this.refresh++;
    this.cd.detectChanges();
  }

  async delete_post()
  {
    if (!confirm("Delete this post?"))
      return;

    await this.api.delete_game(this.id);
    this.snack.open("Post deleted", "Close", {duration: 2500});
    this.router.navigate(["/home"]);
  }

  async request_to_join()
  {
    await this.api.request_to_join(this.id);
    this.requested = true;
    this.snack.open("Request sent", "Close", {duration: 2500});
    this.cd.detectChanges();
  }

  async cancel_request()
  {
    await this.api.cancel_request(this.id);
    this.requested = false;
    this.snack.open("Request cancelled", "Close", {duration: 2500});
    this.cd.detectChanges();
  }

  async accept(user_id: string)
  {
    await this.api.accept_request(this.id, user_id);
    if (this.post) this.post.accepted_user_id = user_id;
    this.snack.open("Request accepted", "Close", {duration: 2500});
    this.cd.detectChanges();
  }
}
