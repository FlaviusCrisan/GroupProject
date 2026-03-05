import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { register } from 'swiper/element/bundle';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../services/api.service';
register();

@Component({
  selector: 'app-home',
  imports: [RouterModule, MatButtonModule, MatSidenavModule, MatListModule, MatIconModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class Home implements OnInit {

  constructor(private api: ApiService) {}

  async ngOnInit(): Promise<void>
  {
    let res = await firstValueFrom(this.api.delete_all_posts());
    res = await firstValueFrom(this.api.get_games());
	console.log(res);
    res = await firstValueFrom(this.api.post_game("post1"));
    res = await firstValueFrom(this.api.get_games());
	console.log(res);
    res = await firstValueFrom(this.api.post_game("post2"));
    res = await firstValueFrom(this.api.get_games());
	console.log(res);
  }

}
