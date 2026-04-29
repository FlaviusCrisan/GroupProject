import { HttpClient } from '@angular/common/http';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Post, PostInfo } from '../Post';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

declare const Clerk: any;

@Injectable({
  providedIn: 'root'
})
export class ApiService 
{
  clerk_initialized = false;
  user_info_cache = new Map<string, Promise<any>>();
  filter_data: any = null;

  constructor(private http: HttpClient, private router: Router)
  {
	  console.log(environment.api_url);
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => { this.user_info_cache.clear(); });
  }

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

  async get_user_id() : Promise<string> 
  {
    await this.init_clerk();
    if (!this.clerk_initialized) throw new Error("Clerk not initialized");
    return Clerk.user.id;
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

  async get_games(filters: any): Promise<Post[]>
  {
    const query_params = new URLSearchParams(filters).toString();
    const array = await firstValueFrom(this.http.get<any[]>(`${environment.api_url}/api/posts?${query_params}`));
    return array.map(json => Post.from_json(this, json));
  }

  async get_game(id: number): Promise<Post>
  {
    const json = await firstValueFrom(this.http.get(`${environment.api_url}/api/posts/${id}`));
    return Post.from_json(this, json);
  }

  async post_game(info: PostInfo)
  {
    return await firstValueFrom(this.http.post(`${environment.api_url}/api/posts`, info, {headers: {Authorization: `Bearer ${await this.get_token()}`}}));
  }

  async update_game(id: number, info: PostInfo)
  {
    return await firstValueFrom(this.http.patch(`${environment.api_url}/api/posts/${id}`, info, {headers: {Authorization: `Bearer ${await this.get_token()}`}}));
  }

  async delete_game(id: number)
  {
    return await firstValueFrom(this.http.delete(`${environment.api_url}/api/posts/${id}`, {headers: {Authorization: `Bearer ${await this.get_token()}`}}));
  }

  async get_user_info(id: string): Promise<any>
  {
    const cached = this.user_info_cache.get(id);
    if (cached)
      return cached;

    const request = firstValueFrom(this.http.get(`${environment.api_url}/api/users/${id}`)) as any;
    this.user_info_cache.set(id, request);
    return request;
  }

  async update_user_metadata(publicMetadata: any)
  {
    return await firstValueFrom(this.http.patch(`${environment.api_url}/api/users/metadata`, {publicMetadata}, {headers: {Authorization: `Bearer ${await this.get_token()}`}}));
  }

  async get_messages(id: string)
  {
    return await firstValueFrom(this.http.get(`${environment.api_url}/api/messages/${id}`, {headers: {Authorization: `Bearer ${await this.get_token()}`}}));
  }

  async send_message(id: string, message: string)
  {
    return await firstValueFrom(this.http.post(`${environment.api_url}/api/messages`, {receiverId: id, content: message}, {headers: {Authorization: `Bearer ${await this.get_token()}`}}));
  }

  async request_to_join(id: number)
  {
    return await firstValueFrom(this.http.patch(`${environment.api_url}/api/posts/${id}/join`, {}, {headers: {Authorization: `Bearer ${await this.get_token()}`}}));
  }

  async cancel_request(id: number)
  {
    return await firstValueFrom(this.http.delete(`${environment.api_url}/api/posts/${id}/join`, {headers: {Authorization: `Bearer ${await this.get_token()}`}}));
  }

  async has_requested(id: number): Promise<boolean>
  {
    const json = await firstValueFrom(this.http.get(`${environment.api_url}/api/posts/${id}/hasRequested`, {headers: {Authorization: `Bearer ${await this.get_token()}`}})) as any;
    return json.hasRequested;
  }

  async get_requests(id: number)
  {
    return await firstValueFrom(this.http.get(`${environment.api_url}/api/posts/${id}/requests`, {headers: {Authorization: `Bearer ${await this.get_token()}`}}));
  }

  async accept_request(post_id: number, user_id: string)
  {
    return await firstValueFrom(this.http.post(`${environment.api_url}/api/posts/${post_id}/accept`, {clerk_id: user_id}, {headers: {Authorization: `Bearer ${await this.get_token()}`}}));
  }

  async get_filter_data()
  {
    if (this.filter_data)
      return this.filter_data;

    this.filter_data = await firstValueFrom(this.http.get(`${environment.api_url}/api/games`)) as any;
    return this.filter_data;
  }

  async get_user_requests(joined?: boolean)
  {
    let url = `${environment.api_url}/api/users/requests`;
    if (joined !== undefined)
      url += `?joined=${joined ? 1 : 0}`;

    const array = await firstValueFrom(this.http.get<any[]>(url, {headers: {Authorization: `Bearer ${await this.get_token()}`}}));
    return array.map(json => Post.from_json(this, json));
  }
}
