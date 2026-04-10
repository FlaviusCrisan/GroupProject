import { Component, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Post } from '../../Post';
import { PostComponent } from '../../components/post/post';

@Component({
  selector: 'app-post-page',
  imports: [PostComponent],
  templateUrl: './post-page.html',
  styleUrl: './post-page.css',
})
export class PostPage
{
  id: number;

  constructor(private api: ApiService, private route: ActivatedRoute, private cd: ChangeDetectorRef)
  {
    this.id = Number(this.route.snapshot.paramMap.get("id"));
  }
}
