import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Post } from '../../Post';
import { PostComponent } from '../../components/post/post';
import { MessagingComponent } from '../../components/messaging/messaging';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-post-page',
  imports: [CommonModule, MatButtonModule, MatCardModule, PostComponent, MessagingComponent],
  templateUrl: './post-page.html',
  styleUrl: './post-page.css',
})
export class PostPage implements OnInit
{
  id: number;
  post: Post | undefined;
  is_self: boolean = false;
  accepted_is_self: boolean = false;
  requested: boolean = false;
  requests: any[] = [];

  constructor(public api: ApiService, private route: ActivatedRoute, private cd: ChangeDetectorRef)
  {
    this.id = Number(this.route.snapshot.paramMap.get("id"));
  }

  async ngOnInit()
  {
    this.post = (await this.api.get_game(this.id))!;

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

  async request_to_join()
  {
    await this.api.request_to_join(this.id);
    this.requested = true;
    this.cd.detectChanges();
  }

  async accept(user_id: string)
  {
    await this.api.accept_request(this.id, user_id);
    if (this.post) this.post.accepted_user_id = user_id;
    this.cd.detectChanges();
  }
}
