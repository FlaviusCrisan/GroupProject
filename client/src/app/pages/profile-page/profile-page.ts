import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { PostList } from '../../components/post-list/post-list';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { GameIcon } from '../../components/game-icon/game-icon';

@Component({
  selector: 'app-profile-page',
  imports: [
    GameIcon,
    MatCardModule,
    MatButtonModule,
    FormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatSnackBarModule,
  ],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.css',
})
export class ProfilePage implements OnInit {
  user_info?: any;
  is_self?: boolean;
  editing: boolean = false;
  socials: any = {};
  preferred_games: string = '';
  saving = false;
  private originalSocials: any;
  private originalGames = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private api: ApiService,
    private cd: ChangeDetectorRef,
    private snack: MatSnackBar,
  ) {}

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    const current_id = await this.api.get_user_id();
    this.is_self = id === current_id;
    try {
      this.user_info = await this.api.get_user_info(id);
      if (this.is_self && (window as any).Clerk && (window as any).Clerk.user) {
        this.user_info.imageUrl = (window as any).Clerk.user.imageUrl;
      }
    } catch {
      this.user_info = {
        id,
        username: 'User',
        imageUrl: this.is_self ? (window as any).Clerk?.user?.imageUrl : '',
        publicMetadata: {},
      };
    }
    this.socials = Object.assign(
      {
        discord: '',
        steam: '',
        riot: '',
        region: 'EU',
        language: 'English',
        bio: '',
      },
      this.user_info.publicMetadata?.socials || {},
    );

    // Support top-level bio if stored there by setup
    if (this.user_info.publicMetadata?.bio) {
      this.socials.bio = this.user_info.publicMetadata.bio;
    }

    this.preferred_games = this.get_games_text();
    this.cd.detectChanges();
  }

  open_dms() {
    this.router.navigate(['user', this.user_info?.id, 'dms']);
  }

  edit_profile() {
    this.originalSocials = { ...this.socials };
    this.originalGames = this.preferred_games;
    this.editing = true;
  }

  cancel_edit() {
    if (this.saving) return;
    this.socials = this.originalSocials;
    this.preferred_games = this.originalGames;
    this.editing = false;
  }

  async save_profile() {
    if (this.saving) return;
    this.saving = true;
    try {
      const games = this.preferred_games
        .split(',')
        .map((game) => game.trim())
        .filter((game) => game);
      const publicMetadata = Object.assign({}, this.user_info.publicMetadata || {});
      publicMetadata.socials = this.socials;
      publicMetadata.preferred_games = games;

      const result: any = await this.api.update_user_metadata(publicMetadata);
      this.user_info.publicMetadata = result.publicMetadata;
      this.editing = false;
      this.snack.open('Profile updated', 'Close', { duration: 2500 });
      this.cd.detectChanges();
    } catch {
      this.snack.open('Your changes could not be saved. Please try again.', 'Close', {
        duration: 4000,
      });
    } finally {
      this.saving = false;
      this.cd.detectChanges();
    }
  }

  get_games_text() {
    const games = this.user_info?.publicMetadata?.preferred_games;
    if (Array.isArray(games)) return games.join(', ');
    return games || '';
  }

  get_steam_link() {
    const steam = this.user_info?.publicMetadata?.socials?.steam;
    if (!steam) return '';
    if (/^https?:\/\//i.test(steam)) {
      try {
        const url = new URL(steam);
        return url.hostname === 'steamcommunity.com' ? url.href : '';
      } catch {
        return '';
      }
    }
    return 'https://steamcommunity.com/id/' + encodeURIComponent(steam);
  }
}
