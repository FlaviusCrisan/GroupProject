export class Post
{
  constructor(
    public id: number,
    public joined: boolean,
    public created_at: Date,
    public info: PostInfo
  )
  {}

  static from_json(json: any)
  {
    const info = new PostInfo();
    info.title = json.title;
    info.description = json.description;
    info.game = json.game;
    info.game_mode = json.game_mode;
    info.rank = json.rank;
    info.region = json.region;
    info.platform = json.platform;
    info.language = json.language;
    info.age_range = json.age_range;
    info.gender = json.gender;
    return new Post(json.id, json.joined, json.created_at, info);
  }
}

export class PostInfo
{
  title: string = "";
  description: string = "";
  game: string = "";
  game_mode: string = "";
  rank: string = "";
  region: string = "";
  platform: string = "";
  language: string = "";
  age_range: string = "";
  gender: string = "";
}
