import { Component, Input, SimpleChanges, ChangeDetectorRef, OnChanges, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-messaging',
  imports: [CommonModule, MatCardModule, MatInputModule, FormsModule, MatFormFieldModule, MatIconModule],
  templateUrl: './messaging.html',
  styleUrl: './messaging.css',
})
export class MessagingComponent implements OnChanges, OnDestroy
{
  @Input() id!: string;
  @ViewChild('bottom') bottom!: ElementRef;

  left_user_info?: any;
  right_user_info?: any;
  chat_message: string = "";
  message_list: any[] = [];
  interval: any;

  constructor(private api: ApiService, private cd: ChangeDetectorRef) {}

  async ngOnChanges(changes: SimpleChanges)
  {
    this.left_user_info = await this.api.get_user_info(this.id);
    this.right_user_info = await this.api.get_user_info(await this.api.get_user_id());

    await this.update_messages();
    if (this.interval) clearInterval(this.interval);
    this.interval = setInterval(() => this.update_messages(), 1000);
  }

  async ngOnDestroy() 
  {
    if (this.interval)
      clearInterval(this.interval);
  }

  async update_messages()
  {
    const old = this.message_list;
    this.message_list = await this.api.get_messages(this.left_user_info.id) as any[];
    await this.cd.detectChanges();

    if (old.length !== this.message_list.length)
      this.scroll_to_bottom();
  }

  scroll_to_bottom()
  {
    this.bottom.nativeElement.scrollIntoView({ behavior: 'smooth' });
  }

  async send(event: Event)
  {
    const message = this.chat_message;
    event.preventDefault();
    this.chat_message = "";

    if (!message || message.trim() === '')
      return;

    await this.api.send_message(this.left_user_info.id, message);
    await this.update_messages();
    this.scroll_to_bottom();
  }
}
