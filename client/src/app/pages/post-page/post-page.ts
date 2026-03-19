import { Component, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { ApiService } from '../../services/api.service';
import { Post } from '../../Post';

@Component({
  selector: 'app-post-page',
  imports: [MatCardModule, MatChipsModule],
  templateUrl: './post-page.html',
  styleUrl: './post-page.css',
})
export class PostPage implements AfterViewInit
{
  post?: Post;

  constructor(private api: ApiService, private route: ActivatedRoute, private cd: ChangeDetectorRef) {}

  async ngAfterViewInit() 
  {
    const id = Number(this.route.snapshot.paramMap.get("id"));
    this.post = await this.api.get_game(id);
    this.cd.detectChanges();
  }
}
