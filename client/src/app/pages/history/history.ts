import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { PostList } from '../../components/post-list/post-list';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-history',
  imports: [PostList, MatCardModule],
  templateUrl: './history.html',
  styleUrl: './history.css',
})
export class History
{
  constructor(api: ApiService) {}
}
