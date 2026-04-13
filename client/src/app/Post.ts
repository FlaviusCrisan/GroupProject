import { ApiService } from "./services/api.service"

export class Post
{
  constructor(
    public id: number,
    public user_id: string,
    public created_at: Date,
    public info: PostInfo,
    public accepted_user_id?: string,
  )
  {}

  static from_json(api: ApiService, json: any)
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
    return new Post(json.id, json.clerk_id, json.created_at, info, json.joined ? json.accepted_clerk_id : undefined);
  }

  static async get_game(api: ApiService, game: string): Promise<any>
  {
    const games = (await api.get_filter_data()).games;

    let game_names: string[] = [];
    for (const key in games)
      if (games[key].name === game)
        return games[key];

    throw new Error("game doesnt exist: " + game);
  }

  static async get_games(api: ApiService): Promise<string[]>
  {
    const games = (await api.get_filter_data()).games;

    let game_names: string[] = [];
    for (const key in games)
      game_names.push(games[key].name);

    return game_names;
  }

  static async get_game_modes(api: ApiService, game: string): Promise<string[]>
  {
    return (await Post.get_game(api, game)).modes;
  }

  static async get_ranks(api: ApiService, game: string): Promise<string[]>
  {
    return (await Post.get_game(api, game)).ranks;
  }

  static async get_platforms(api: ApiService, game: string): Promise<string[]>
  {
    return (await Post.get_game(api, game)).platforms;
  }

  static async get_regions(api: ApiService): Promise<string[]>
  {
    return (await api.get_filter_data()).regions;
  }

  static async get_languages(api: ApiService): Promise<string[]>
  {
    return (await api.get_filter_data()).languages;
  }

  static async get_age_ranges(api: ApiService): Promise<string[]>
  {
    return (await api.get_filter_data()).age_ranges;
  }

  static async get_genders(api: ApiService): Promise<string[]>
  {
    return (await api.get_filter_data()).genders;
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
