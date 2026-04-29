import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../../services/api.service';
import { MatButtonModule } from '@angular/material/button';

import { SetupDialog } from '../setup-dialog/setup-dialog';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-layout',
  imports: [MatButtonModule, MatIconModule, RouterOutlet, SetupDialog, CommonModule],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout implements OnInit
{
  user_info?: any;
  is_dark: boolean = true;
  show_setup: boolean = false;

  constructor(private router: Router, private api: ApiService, private cd: ChangeDetectorRef) {}

  async ngOnInit()
  {
    this.is_dark = localStorage.getItem('theme') !== 'light';
    this.update_theme();
    const user_id = await this.api.get_user_id();
    try {
      this.user_info = await this.api.get_user_info(user_id);
      
      // Check if setup is needed
      if (this.user_info && !this.user_info.publicMetadata?.setup_complete) {
        this.show_setup = true;
      }

      if ((window as any).Clerk && (window as any).Clerk.user) {
        this.user_info.imageUrl = (window as any).Clerk.user.imageUrl;
      }
    } catch {
      this.user_info = { id: user_id, imageUrl: (window as any).Clerk?.user?.imageUrl || '' };
      this.show_setup = true; // Show setup if we can't fetch profile (likely first time or API error)
    }
    await this.cd.detectChanges();
  }

  toggle_theme()
  {
    this.is_dark = !this.is_dark;
    localStorage.setItem('theme', this.is_dark ? 'dark' : 'light');
    this.update_theme();
  }

  update_theme()
  {
    if (this.is_dark)
      document.body.classList.remove('light-theme');
    else
      document.body.classList.add('light-theme');
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

  chats()
  {
    this.router.navigate(["/chats"]);
  }
}
