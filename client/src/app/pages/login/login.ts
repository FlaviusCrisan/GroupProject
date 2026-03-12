import { Component, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements AfterViewInit {
  constructor(private api: ApiService, private router: Router) {}

  async ngAfterViewInit() : Promise<void>
  {
    const is_signed_in = await this.api.is_signed_in();
    if (is_signed_in)
      await this.router.navigate(["/home"]);
    else
      await this.api.mount_sign_in(document.getElementById("sign-in") as HTMLDivElement, "/home");
  }
}
