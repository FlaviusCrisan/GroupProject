import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-profile-page',
  imports: [MatCardModule, MatButtonModule],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.css',
})
export class ProfilePage implements OnInit
{
  user_info?: any;

  constructor(private route: ActivatedRoute, private api: ApiService, private cd: ChangeDetectorRef) {}

  async ngOnInit()
  {
    this.user_info = await this.api.get_user_info(this.route.snapshot.paramMap.get("id")!);
    this.cd.detectChanges();
  }
}
