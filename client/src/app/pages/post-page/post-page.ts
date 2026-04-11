import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Post } from '../../Post';
import { PostComponent } from '../../components/post/post';
import { MessagingComponent } from '../../components/messaging/messaging';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-post-page',
  imports: [MatButtonModule, MatCardModule, PostComponent, MessagingComponent],
  templateUrl: './post-page.html',
  styleUrl: './post-page.css',
})
export class PostPage implements OnInit
{
  id: number;
  user_id?: string;

  constructor(private api: ApiService, private route: ActivatedRoute, private cd: ChangeDetectorRef)
  {
    this.id = Number(this.route.snapshot.paramMap.get("id"));
  }

  async ngOnInit()
  {
    const post = await this.api.get_game(this.id);
    const user_info = await this.api.get_user_info(post.user_id);
    this.user_id = user_info.id;
    this.cd.detectChanges();
  }
}
