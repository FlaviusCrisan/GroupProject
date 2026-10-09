import {
  Component,
  Input,
  SimpleChanges,
  ChangeDetectorRef,
  OnChanges,
  OnDestroy,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { ApiService } from '../../services/api.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { GameIcon } from '../game-icon/game-icon';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-messaging',
  imports: [CommonModule, MatCardModule, MatInputModule, FormsModule, MatFormFieldModule, GameIcon],
  templateUrl: './messaging.html',
  styleUrl: './messaging.css',
})
export class MessagingComponent implements OnChanges, OnDestroy {
  @Input() id!: string;
  @ViewChild('bottom') bottom!: ElementRef;

  left_user_info?: any;
  right_user_info?: any;
  chat_message: string = '';
  message_list: any[] = [];
  interval: any;
  sending = false;
  error = '';

  constructor(
    private api: ApiService,
    private cd: ChangeDetectorRef,
  ) {}

  async ngOnChanges(changes: SimpleChanges) {
    try {
      this.left_user_info = await this.api.get_user_info(this.id);
      this.right_user_info = await this.api.get_user_info(await this.api.get_user_id());
    } catch {
      this.error = 'The conversation could not be loaded. Please try again.';
      this.cd.detectChanges();
      return;
    }

    await this.update_messages();
    if (this.interval) clearInterval(this.interval);
    this.interval = setInterval(() => this.update_messages(), 3000);
  }

  async ngOnDestroy() {
    if (this.interval) clearInterval(this.interval);
  }

  async update_messages() {
    const old = this.message_list;
    try {
      this.message_list = (await this.api.get_messages(this.id)) as any[];
      this.error = '';
    } catch {
      this.error = 'Messages could not be refreshed. We will try again.';
    }
    await this.cd.detectChanges();

    if (old.length !== this.message_list.length) this.scroll_to_bottom();
  }

  scroll_to_bottom() {
    this.bottom?.nativeElement?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  onEnter(event: Event) {
    if (!(event as KeyboardEvent).shiftKey) this.send(event);
  }

  async send(event: Event) {
    const message = this.chat_message.trim();
    event.preventDefault();
    if (!message || this.sending) return;
    this.sending = true;
    this.error = '';
    try {
      await this.api.send_message(this.id, message);
      this.chat_message = '';
      await this.update_messages();
      this.scroll_to_bottom();
    } catch {
      this.error = 'Your message was not sent. Your draft is still here; try again.';
    } finally {
      this.sending = false;
      this.cd.detectChanges();
    }
  }
}
