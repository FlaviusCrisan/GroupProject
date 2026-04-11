import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
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
  is_self?: boolean;

  constructor(private router: Router, private route: ActivatedRoute, private api: ApiService, private cd: ChangeDetectorRef) {}

  async ngOnInit()
  {
    this.user_info = await this.api.get_user_info(this.route.snapshot.paramMap.get("id")!);
    this.is_self = this.user_info.id === await this.api.get_user_id();
    this.cd.detectChanges();
  }

  open_dms()
  {
    this.router.navigate(['user', this.user_info?.id, 'dms']);
  }

  edit_profile()
  {
    window.location.href = "https://climbing-liger-76.accounts.dev/user";
  }
}
