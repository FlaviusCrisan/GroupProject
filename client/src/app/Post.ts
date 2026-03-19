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
    info.username = json.username;
    info.game = json.game;
    info.game_mode = json.game_mode;
    info.skill_level = json.skill_level;
    info.region = json.region;
    return new Post(json.id, json.joined, json.created_at, info);
  }
}

export class PostInfo
{
  title: string = "";
  description: string = "";
  username: string = "";
  game: string = "";
  game_mode: string = "";
  skill_level: string = "";
  region: string = "";
}
