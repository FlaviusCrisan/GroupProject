import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MessagingComponent } from '../../components/messaging/messaging';

@Component({
  selector: 'app-dms-page',
  imports: [MessagingComponent],
  templateUrl: './dms-page.html',
  styleUrl: './dms-page.css',
})
export class DmsPage
{
  id: string;

  constructor(private route: ActivatedRoute)
  {
    this.id = this.route.snapshot.paramMap.get("id")!;
  }
}
