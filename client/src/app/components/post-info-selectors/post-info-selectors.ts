import { Component, Output, EventEmitter, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { ApiService } from '../../services/api.service';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { Post } from '../../Post';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-post-info-selectors',
  imports: [MatCardModule, MatFormFieldModule, MatSelectModule, MatInputModule, FormsModule, CommonModule, MatButtonModule],
  templateUrl: './post-info-selectors.html',
  styleUrl: './post-info-selectors.css',
})
export class PostInfoSelectors implements OnInit
{
  @Output() on_changed = new EventEmitter<Record<string, string>>();

  templates: any[] = [];
  posts: Post[] = [];
  selected: Record<string, string> = {};

  constructor(private cd: ChangeDetectorRef, private api: ApiService) {}

  async ngOnInit()
  {
    this.templates = [
      {name: "Game",      db_name: "game",      values: await Post.get_games(this.api)},
      {name: "Region",    db_name: "region",    values: await Post.get_regions(this.api)},
      {name: "Language",  db_name: "language",  values: await Post.get_languages(this.api)},
      {name: "Age range", db_name: "age_range", values: await Post.get_age_ranges(this.api)},
      {name: "Gender",    db_name: "gender",    values: await Post.get_genders(this.api)},
    ];

    for (let i = 0; i < this.templates.length; ++i)
      this.selected[this.templates[i].name] = "Any";

    await this.update();
  }

  set_template(name: string, object: any)
  {
    let index = -1;
    for (let i = 0; i < this.templates.length; ++i)
    {
      if (this.templates[i].name === name)
      {
        index = i;
        break;
      }
    }

    let new_templates: any[] = [];
    if (object === null)
    {
      delete this.selected[name];

      for (let i = 0; i < this.templates.length; ++i)
        if (i !== index)
          new_templates.push(this.templates[i]);
    }
    else
    {
      new_templates = this.templates;
      if (index === -1)
      {
        this.selected[name] = "Any";
        new_templates.push(object);
      }
      else
      {
        new_templates[index] = object;
        if (!object.values.includes(this.selected[name]))
          this.selected[name] = "Any";
      }
    }

    this.templates = new_templates;
  }

  async update()
  {
    if (this.selected["Game"] === "Any")
    {
      this.set_template("Mode", null)
      this.set_template("Rank", null)
      this.set_template("Platform", null)
    }
    else
    {
      const mode_values = await Post.get_game_modes(this.api, this.selected["Game"]);
      const rank_values = await Post.get_ranks(this.api, this.selected["Game"]);
      const platform_values = await Post.get_platforms(this.api, this.selected["Game"]);

      if (mode_values)
        this.set_template("Mode", {name: "Mode", db_name: "game_mode", values: mode_values})
      else
        this.set_template("Mode", null)

      if (rank_values)
        this.set_template("Rank", {name: "Rank", db_name: "rank", values: rank_values})
      else
        this.set_template("Rank", null)

      if (platform_values)
        this.set_template("Platform", {name: "Platform", db_name: "platform", values: platform_values})
      else
        this.set_template("Platform", null)
    }
    this.cd.detectChanges();

    let selected: Record<string, string> = {};
    for (let i = 0; i < this.templates.length; ++i)
    {
      const value = this.selected[this.templates[i].name];
      if (value !== "Any")
        selected[this.templates[i].db_name] = value
    }
    
    this.on_changed.emit(selected);
  }

  async clear()
  {
    for (let i = 0; i < this.templates.length; ++i)
      this.selected[this.templates[i].name] = "Any";

    await this.update();
  }
}
