import { Component, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements AfterViewInit {
  error = '';
  constructor(
    private api: ApiService,
    private router: Router,
    private cd: ChangeDetectorRef,
  ) {}

  async ngAfterViewInit(): Promise<void> {
    await this.loadSignIn();
  }

  async loadSignIn() {
    this.error = '';
    try {
      const is_signed_in = await this.api.is_signed_in();
      if (is_signed_in) await this.router.navigate(['/home']);
      else
        await this.api.mount_sign_in(document.getElementById('sign-in') as HTMLDivElement, '/home');
    } catch {
      this.error = 'Sign-in is unavailable right now. Please try again.';
    } finally {
      this.cd.detectChanges();
    }
  }
}
