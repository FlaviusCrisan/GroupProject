import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

declare const Clerk: any;

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  base_url = "http://localhost:3000";

  constructor(private http: HttpClient) {}

  async init_clerk() {
    await new Promise<void>(resolve => {
      if ((window as any).Clerk) return resolve();
      const interval = setInterval(() => {
        if ((window as any).Clerk) {
          clearInterval(interval);
          resolve();
        }
      }, 50);
    });

    await Clerk.load();
    console.log('ClerkJS is loaded');
  }

  is_signed_in() : boolean {
    return Clerk.isSignedIn;
  }

  async get_token() : Promise<string | null> {
    return Clerk.session?.getToken() ?? null;
  }

  async mount_user_button(e: HTMLDivElement) {
    if (!e)
      console.log("element is null");
    await Clerk.mountUserButton(e);
  }

  async mount_sign_in(e: HTMLDivElement, after_sign_in_url: string) {
    if (!e)
      console.log("element is null");
    await Clerk.mountSignIn(e, {afterSignInUrl: after_sign_in_url});
  }

  get_games()
  {
    return this.http.get(`${this.base_url}/api/posts`);
  }

  post_game(token: string, title: string, description: string, username: string, game: string)
  {
    return this.http.post(`${this.base_url}/api/posts`, {
      title: title,
      description: description,
      username: username,
      game: game,
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }
}
