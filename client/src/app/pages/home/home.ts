import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { PostList } from '../../components/post-list/post-list';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-home',
  imports: [RouterModule, PostList, MatButtonModule, MatIconModule, MatCardModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
  schemas: [],
})
export class Home {
  constructor(private api: ApiService, private router: Router) {}

  async quickMatch() {
    const posts = await this.api.get_games({});
    const myId = await this.api.get_user_id();
    const me = await this.api.get_user_info(myId);

    let bestPost = null;
    let maxScore = -1;

    for (const post of posts) {
      if (post.user_id === myId) continue;
      
      let score = 50;
      if (me.publicMetadata?.preferred_games?.includes(post.info.game)) score += 20;
      if (me.publicMetadata?.socials?.language === post.info.language) score += 15;
      if (me.publicMetadata?.socials?.region === post.info.region) score += 15;

      if (score > maxScore) {
        maxScore = score;
        bestPost = post;
      }
    }

    if (bestPost) {
      this.router.navigate(['/post', bestPost.id]);
    } else {
      alert("No suitable matches found at the moment!");
    }
  }
}
