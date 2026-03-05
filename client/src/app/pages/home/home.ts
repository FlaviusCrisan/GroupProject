import { Component, OnInit, ChangeDetectorRef, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { register } from 'swiper/element/bundle';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
register();

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule, MatButtonModule, MatSidenavModule, MatListModule, MatIconModule, FormsModule, MatInputModule, MatFormFieldModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class Home implements OnInit {

  text : string = "";
  posts : any[] = [];

  constructor(private api: ApiService, private cd: ChangeDetectorRef) {}

  async ngOnInit(): Promise<void>
  {
    this.load_posts();
  }

  async load_posts()
  {
    let res = await firstValueFrom(this.api.get_games());
	this.posts = res as any[];
	this.cd.detectChanges();
    console.log(res);
	return res;
  }

  async add()
  {
    let res = await firstValueFrom(this.api.post_game(this.text));
	console.log(res);
	this.text = "";
	await this.load_posts();
  }

}
