import { Component } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-post-game',
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './post-game.html',
  styleUrl: './post-game.css',
})
export class PostGame
{
  title : string = "";
  description : string = "";

  constructor(private api: ApiService, private router: Router) {}

  async add()
  {
    (await this.api.post_game((await this.api.get_token())!, this.title, this.description, "username", "game"))!;
    this.router.navigate(["/home"]);
  }
}
