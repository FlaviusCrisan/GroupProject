import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { Post, Region, Platform, Language, AgeRange, Gender } from '../../Post';

@Component({
  selector: 'app-post-info-selectors',
  imports: [MatFormFieldModule, MatSelectModule, MatInputModule, FormsModule, CommonModule],
  templateUrl: './post-info-selectors.html',
  styleUrl: './post-info-selectors.css',
})
export class PostInfoSelectors implements OnInit
{
  @Output() on_changed = new EventEmitter<Record<string, string>>();

  templates = [
    {name: "Region",    db_name: "region",    values: Object.values(Region)   as Region[]},
    {name: "Platform",  db_name: "platform",  values: Object.values(Platform) as Platform[]},
    {name: "Language",  db_name: "language",  values: Object.values(Language) as Language[]},
    {name: "Age range", db_name: "age_range", values: Object.values(AgeRange) as AgeRange[]},
    {name: "Gender",    db_name: "gender",    values: Object.values(Gender)   as Gender[]},
  ];

  posts: Post[] = [];
  selected: Record<string, string> = {};

  constructor()
  {
    for (let i = 0; i < this.templates.length; ++i)
      this.selected[this.templates[i].name] = "Any";
  }

  async ngOnInit()
  {
    this.update();
  }

  update()
  {
    let selected: Record<string, string> = {};
    for (let i = 0; i < this.templates.length; ++i)
    {
      const value = this.selected[this.templates[i].name];
      if (value !== "Any")
        selected[this.templates[i].db_name] = value
    }
    
    this.on_changed.emit(selected);
  }
}
