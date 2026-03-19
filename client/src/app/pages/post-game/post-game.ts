import { Component } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Post, PostInfo } from '../../Post';

@Component({
  selector: 'app-post-game',
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './post-game.html',
  styleUrl: './post-game.css',
})
export class PostGame
{
  info: PostInfo = new PostInfo();

  constructor(private api: ApiService, private router: Router) {}

  async add()
  {
    this.info.username = "whatever";
    (await this.api.post_game((await this.api.get_token())!, this.info))!;
    this.router.navigate(["/home"]);
  }
}
