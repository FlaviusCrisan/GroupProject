import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Post } from '../../Post';
import { PostComponent } from '../../components/post/post';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-post-page',
  imports: [MatButtonModule, MatCardModule, PostComponent],
  templateUrl: './post-page.html',
  styleUrl: './post-page.css',
})
export class PostPage
{
  id: number;

  constructor(private api: ApiService, private route: ActivatedRoute)
  {
    this.id = Number(this.route.snapshot.paramMap.get("id"));
  }
}
