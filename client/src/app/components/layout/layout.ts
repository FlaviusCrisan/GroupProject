import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../../services/api.service';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-layout',
  imports: [MatButtonModule, MatToolbarModule, MatSidenavModule, MatListModule, MatIconModule, RouterOutlet],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout implements OnInit
{
  user_info?: any;

  constructor(private router: Router, private api: ApiService, private cd: ChangeDetectorRef) {}

  async ngOnInit()
  {
    this.user_info = await this.api.get_user_info(await this.api.get_user_id());
    await this.cd.detectChanges();
  }

  async sign_out()
  {
    await this.api.sign_out("/");
  }

  home()
  {
    this.router.navigate(["/home"]);
  }

  async go_to_profile()
  {
    this.router.navigate(['/user', await this.api.get_user_id()]);
  }

  post_game()
  {
    this.router.navigate(["/post-game"]);
  }

  match_history()
  {
    this.router.navigate(["/history"]);
  }
}
