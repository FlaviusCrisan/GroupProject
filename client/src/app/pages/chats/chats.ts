import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Post } from '../../Post';

@Component({
  selector: 'app-chats',
  imports: [CommonModule, RouterLink],
  templateUrl: './chats.html',
  styleUrl: './chats.css',
})
export class Chats implements OnInit {
  conversations: { id: string; name: string; game: string }[] = [];
  loading = true;
  error = false;
  constructor(
    private api: ApiService,
    private cd: ChangeDetectorRef,
  ) {}
  ngOnInit() {
    this.load();
  }
  async load() {
    this.loading = true;
    this.error = false;
    try {
      const myId = await this.api.get_user_id();
      const games: Post[] = await this.api.get_user_requests(true);
      const seen = new Set<string>();
      const conversations = [];
      for (const game of games) {
        const id = game.user_id === myId ? game.accepted_user_id : game.user_id;
        if (!id || seen.has(id)) continue;
        seen.add(id);
        const user = await this.api.get_user_info(id);
        conversations.push({
          id,
          name: user.username || user.firstName || 'Player',
          game: game.info.game,
        });
      }
      this.conversations = conversations;
    } catch {
      this.error = true;
    } finally {
      this.loading = false;
      this.cd.detectChanges();
    }
  }
}
