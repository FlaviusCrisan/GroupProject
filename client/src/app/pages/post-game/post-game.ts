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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-post-game',
  imports: [MatCardModule, PostInfoSelectors, FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSnackBarModule, MatIconModule, CommonModule],
  templateUrl: './post-game.html',
  styleUrl: './post-game.css',
})
export class PostGame
{
  info: PostInfo = new PostInfo();
  add_clicked: boolean = false;

  constructor(public api: ApiService, public router: Router, private snack: MatSnackBar) {}

  async add()
  {
    if (this.add_clicked)
      return;

    if (!this.info.title.trim()) {
      this.snack.open("Title is required", "Close", {duration: 2500});
      return;
    }

    if (!this.info.game) {
      this.snack.open("Choose a game", "Close", {duration: 2500});
      return;
    }

    this.add_clicked = true;

    try {
      (await this.api.post_game(this.info))!;
      this.snack.open("Post created", "Close", {duration: 2500});
      this.router.navigate(["/home"]);
    } catch {
      this.add_clicked = false;
      this.snack.open("Post was not created", "Close", {duration: 2500});
    }
  }

  update_info(info: Record<string, string>)
  {
    this.info.game = info['game'];
    this.info.game_mode = info['game_mode'];
    this.info.rank = info['rank'];
    this.info.region = info['region'];
    this.info.platform = info['platform'];
    this.info.language = info['language'];
    this.info.age_range = info['age_range'];
    this.info.gender = info['gender'];
  }
}
