import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

declare const Clerk: any;

@Injectable({
  providedIn: 'root'
})
export class ApiService 
{
  base_url = "http://localhost:3000";
  private clerk_initialized = false;

  constructor(private http: HttpClient) {}

  private async init_clerk() 
  {
    if (this.clerk_initialized)
      return;

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
    this.clerk_initialized = true;
  }

  async is_signed_in() : Promise<boolean>
  { 
    await this.init_clerk();
    if (!this.clerk_initialized) throw new Error("Clerk not initialized");
    return Clerk.isSignedIn;
  }

  async get_token() : Promise<string | null> 
  {
    await this.init_clerk();
    if (!this.clerk_initialized) throw new Error("Clerk not initialized");
    return Clerk.session?.getToken() ?? null;
  }

  async mount_user_button(e: HTMLDivElement) 
  {
    await this.init_clerk();
    if (!this.clerk_initialized) throw new Error("Clerk not initialized");
    if (!e) throw new Error("element is null");

    await Clerk.mountUserButton(e);
  }

  async mount_sign_in(e: HTMLDivElement, after_sign_in_url: string)
  {
    await this.init_clerk();
    if (!this.clerk_initialized) throw new Error("Clerk not initialized");
    if (!e) throw new Error("element is null");
  
    await Clerk.mountSignIn(e, {afterSignInUrl: after_sign_in_url});
  }

  async sign_out(redirect_url: string) 
  {
    await this.init_clerk();
    if (!this.clerk_initialized) throw new Error("Clerk not initialized");

    await Clerk.signOut({redirectUrl: redirect_url});
  }

  async get_games(): Promise<any>
  {
    return await firstValueFrom(this.http.get(`${this.base_url}/api/posts`));
  }

  async get_game(id: number): Promise<any>
  {
    return await firstValueFrom(this.http.get(`${this.base_url}/api/posts/${id}`));
  }

  async post_game(token: string, title: string, description: string, username: string, game: string): Promise<any>
  {
    await this.init_clerk();
    if (!this.clerk_initialized) throw new Error("Clerk not initialized");

    return await firstValueFrom(this.http.post(`${this.base_url}/api/posts`, {
      title: title,
      description: description,
      username: username,
      game: game,
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }));
  }
}
