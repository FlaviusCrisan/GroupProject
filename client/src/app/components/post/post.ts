import { Component, OnChanges, SimpleChanges, EventEmitter, Input, Output, ChangeDetectorRef } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from '../../services/api.service';
import { Post } from '../../Post';
import { formatDistanceToNow } from 'date-fns';

import { Router } from '@angular/router';

@Component({
  selector: 'app-post',
  imports: [MatCardModule, MatChipsModule, MatButtonModule],
  templateUrl: './post.html',
  styleUrl: './post.css',
})
export class PostComponent implements OnChanges
{
  @Input() id!: number;
  @Input() refresh: number = 0;
  @Output() join_clicked = new EventEmitter<Post>();

  post?: Post;
  user_info?: any;
  time_string?: string;
  join_button: boolean = false;
  chips: {text: string, color: string}[] = [];
  game_image: string = '';
  compatibility_score: number = 0;

  constructor(private api: ApiService, private cd: ChangeDetectorRef, private router: Router) {}

  is_owner: boolean = false;

  async delete_post() {
    if (confirm('Are you sure you want to delete this post?')) {
      await this.api.delete_game(this.id);
      window.location.reload();
    }
  }

  async edit_post() {
    const new_title = prompt('Enter new title:', this.post?.info?.title);
    if (!new_title) return;
    const new_desc = prompt('Enter new description:', this.post?.info?.description);
    
    await this.api.update_game(this.id, {
      ...this.post!.info,
      title: new_title,
      description: new_desc || ''
    });
    window.location.reload();
  }

  go_to_profile()
  {
    this.router.navigate(['/user', this.user_info.id]);
  }

  get_bg_image(game: string): string {
    const images: any = {
      'fortnite': 'https://gaming-cdn.com/images/products/6008/orig/fortnite-pc-game-cover.jpg',
      'valorant': 'https://cmsassets.rgpub.io/visibility/pigeon/VALORANT/Product_Page_Background_VALORANT_1920x1080.jpg',
      'cs2': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/730/header.jpg',
      'league_of_legends': 'https://gaming-cdn.com/images/products/9378/orig/league-of-legends-pc-game-cover.jpg',
      'apex_legends': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1172470/header.jpg',
      'roblox': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2102300/header.jpg',
      'minecraft': 'https://gaming-cdn.com/images/products/442/orig/minecraft-java-bedrock-edition-pc-game-cover.jpg',
      'overwatch': 'https://gaming-cdn.com/images/products/12615/orig/overwatch-2-pc-game-cover.jpg',
      'rocket_league': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/252950/header.jpg',
      'rainbow_six_siege': 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/359550/header.jpg'
    };
    return images[game.toLowerCase().replace(/ /g, '_')] || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1000';
  }

  ngOnChanges(changes: SimpleChanges) {
    this.updateData();
  }

  async updateData()
  {
    this.post = await this.api.get_game(this.id);
    this.user_info = await this.api.get_user_info(this.post.user_id);
    this.time_string = formatDistanceToNow(this.post.created_at, { addSuffix: true });
    this.game_image = this.get_bg_image(this.post.info.game || '');

    const current_user_id = await this.api.get_user_id();
    this.is_owner = current_user_id === this.post.user_id;

    // Calculate compatibility score
    try {
      const me = await this.api.get_user_info(current_user_id);
      let score = 50; // Base score
      
      if (me.publicMetadata?.preferred_games?.includes(this.post.info.game)) score += 20;
      if (me.publicMetadata?.socials?.language === this.post.info.language) score += 15;
      if (me.publicMetadata?.socials?.region === this.post.info.region) score += 15;
      
      this.compatibility_score = Math.min(score, 100);
    } catch {
      this.compatibility_score = 0;
    }

    this.chips = [];
    const colors: any = {
      game: 'primary',
      region: 'accent',
      platform: 'warn',
      language: 'secondary',
      gender: 'info'
    };

    for (const key of Object.keys(this.post.info))
    {
      if (key === "title" || key === "description")
        continue;

      const value = (this.post.info as any)[key];
      if (value !== "" && value !== "Any") {
        this.chips.push({
          text: value.toUpperCase(),
          color: colors[key.toLowerCase()] || 'default'
        });
      }
    }

    this.cd.detectChanges();
  }
}
