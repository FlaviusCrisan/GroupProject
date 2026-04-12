import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Post, PostInfo } from '../../Post';
import { PostInfoSelectors } from '../../components/post-info-selectors/post-info-selectors';

@Component({
  selector: 'app-post-game',
  imports: [MatCardModule, PostInfoSelectors, FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './post-game.html',
  styleUrl: './post-game.css',
})
export class PostGame
{
  info: PostInfo = new PostInfo();
  add_clicked: boolean = false;

  constructor(private api: ApiService, private router: Router) {}

  async add()
  {
    if (this.add_clicked)
      return;
    this.add_clicked = true;

    (await this.api.post_game(this.info))!;
    this.router.navigate(["/home"]);
  }

  update_info(info: Record<string, string>)
  {
    Object.assign(this.info, info);
  }
}
