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

@Component({
  selector: 'app-profile-page',
  imports: [PostList, MatCardModule, MatButtonModule, FormsModule, MatInputModule, MatFormFieldModule, MatSnackBarModule],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.css',
})
export class ProfilePage implements OnInit
{
  user_info?: any;
  is_self?: boolean;
  editing: boolean = false;
  socials: any = {};
  preferred_games: string = "";

  constructor(private router: Router, private route: ActivatedRoute, private api: ApiService, private cd: ChangeDetectorRef, private snack: MatSnackBar) {}

  async ngOnInit()
  {
    this.user_info = await this.api.get_user_info(this.route.snapshot.paramMap.get("id")!);
    this.is_self = this.user_info.id === await this.api.get_user_id();
    this.socials = Object.assign({}, this.user_info.publicMetadata?.socials || {});
    this.preferred_games = (this.user_info.publicMetadata?.preferred_games || []).join(", ");
    this.cd.detectChanges();
  }

  open_dms()
  {
    this.router.navigate(['user', this.user_info?.id, 'dms']);
  }

  edit_profile()
  {
    this.editing = true;
  }

  async save_profile()
  {
    const games = this.preferred_games.split(",").map(game => game.trim()).filter(game => game);
    const publicMetadata = Object.assign({}, this.user_info.publicMetadata || {});
    publicMetadata.socials = this.socials;
    publicMetadata.preferred_games = games;

    const result: any = await this.api.update_user_metadata(publicMetadata);
    this.user_info.publicMetadata = result.publicMetadata;
    this.editing = false;
    this.snack.open("Profile updated", "Close", {duration: 2500});
    this.cd.detectChanges();
  }
}
