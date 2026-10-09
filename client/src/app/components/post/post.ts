import {
  Component,
  OnChanges,
  SimpleChanges,
  EventEmitter,
  Input,
  Output,
  ChangeDetectorRef,
} from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Post } from '../../Post';
import { formatDistanceToNow } from 'date-fns';

import { Router } from '@angular/router';

import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-post',
  imports: [CommonModule],
  templateUrl: './post.html',
  styleUrl: './post.css',
})
export class PostComponent implements OnChanges {
  @Input() id!: number;
  @Input() refresh: number = 0;
  @Output() join_clicked = new EventEmitter<Post>();

  post?: Post;
  user_info?: any;
  time_string?: string;
  join_button: boolean = false;
  chips: { text: string; color: string }[] = [];
  error = false;

  constructor(
    private api: ApiService,
    private cd: ChangeDetectorRef,
    private router: Router,
  ) {}

  is_owner: boolean = false;

  go_to_profile() {
    this.router.navigate(['/user', this.user_info.id]);
  }

  ngOnChanges(changes: SimpleChanges) {
    this.updateData();
  }

  async updateData() {
    this.error = false;
    try {
      this.post = await this.api.get_game(this.id);
      this.user_info = await this.api.get_user_info(this.post.user_id);
      this.time_string = formatDistanceToNow(this.post.created_at, { addSuffix: true });

      const current_user_id = await this.api.get_user_id();
      this.is_owner = current_user_id === this.post.user_id;

      this.chips = [];
      const colors: any = {
        game: 'primary',
        region: 'accent',
        platform: 'warn',
        language: 'secondary',
        gender: 'info',
      };

      for (const key of Object.keys(this.post.info)) {
        if (
          key === 'title' ||
          key === 'description' ||
          key === 'game' ||
          key === 'gender' ||
          key === 'age_range'
        )
          continue;

        const value = (this.post.info as any)[key];
        if (typeof value === 'string' && value !== '' && value !== 'Any') {
          this.chips.push({
            text: value.toUpperCase(),
            color: colors[key.toLowerCase()] || 'default',
          });
        }
      }
    } catch {
      this.error = true;
    } finally {
      this.cd.detectChanges();
    }
  }
}
