import { Component, OnInit, ChangeDetectorRef, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { register } from 'swiper/element/bundle';
import { ApiService } from '../../services/api.service';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
register();

@Component({
  selector: 'app-home',
  imports: [MatCardModule, CommonModule, RouterModule, MatButtonModule, MatChipsModule, MatSidenavModule, MatListModule, MatIconModule, FormsModule, MatInputModule, MatFormFieldModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class Home implements OnInit {

  text : string = "";
  posts : any[] = [];

  constructor(private api: ApiService, private cd: ChangeDetectorRef, private router: Router) {}

  async ngOnInit() : Promise<void>
  {
    await this.load_posts();
  }

  async load_posts()
  {
    let res = await this.api.get_games();
    this.posts = res as any[];
    this.cd.detectChanges();
    return res;
  }

  async add()
  {
    let res = (await this.api.post_game((await this.api.get_token())!, this.text, "DESC123", "username", "game"))!;
    this.text = "";
    await this.load_posts();
  }

  async sign_out()
  {
    await this.api.sign_out("/");
  }

  async join(post: any)
  {
    this.router.navigate(['/post', post.id]);
  }
}
