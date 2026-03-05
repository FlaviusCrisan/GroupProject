import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  base_url = "http://localhost:3000";

  constructor(private http: HttpClient) {}

  get_games()
  {
    return this.http.get(`${this.base_url}/api/posts`);
  }

  post_game(info : string)
  {
    return this.http.post(`${this.base_url}/api/posts`, {info: info});
  }

  delete_all_posts()
  {
    return this.http.delete(`${this.base_url}/api/posts`);
  }
}
