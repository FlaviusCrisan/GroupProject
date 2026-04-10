import { Component, OnChanges, SimpleChanges, EventEmitter, Input, Output, ChangeDetectorRef } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from '../../services/api.service';
import { Post } from '../../Post';
import { formatDistanceToNow } from 'date-fns';

@Component({
  selector: 'app-post',
  imports: [MatCardModule, MatChipsModule, MatButtonModule],
  templateUrl: './post.html',
  styleUrl: './post.css',
})
export class PostComponent implements OnChanges
{
  @Input() id!: number;
  @Output() join_clicked = new EventEmitter<Post>();

  post?: Post;
  user_info?: any;
  time_string?: string;
  join_button: boolean = false;

  constructor(private api: ApiService, private cd: ChangeDetectorRef) {}

  async ngOnChanges(changes: SimpleChanges)
  {
    this.post = await this.api.get_game(this.id);
    this.user_info = await this.api.get_user_info();
    this.time_string = formatDistanceToNow(this.post.created_at, { addSuffix: true });
    this.cd.detectChanges();
  }
}
