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
    return new Post(json.id, json.clerk_id, json.created_at, info, json.joined ? json.accepted_clerk_id : undefined);
  }
}

export enum Gender
{
  Male = "Male",
  Female = "Female",
}

export enum Region
{
  Europe = "Europe",
  NorthAmerica = "North America",
  SouthAmerica = "South America",
  Africa = "Africa",
  Asia = "Asia",
  Oceania = "Oceania",
}

export enum Platform
{
  PC = "PC",
  PlayStation = "PlayStation",
  Xbox = "Xbox",
  Switch = "Switch",
  Mobile = "Mobile",
}

export enum Language
{
  English = "English",
  Spanish = "Spanish",
  Portuguese = "Portuguese",
  Russian = "Russian",
  Japanese = "Japanese",
  Mandarin = "Mandarin",
  Hindi = "Hindi",
}

export enum AgeRange
{
  LessThanTwenty = "<20",
  Twenty = "20-30",
  Thirty = "30-40",
  Fourty = "40-50",
  Fifty = "50-60",
  SixtyAndAbove = "60+",
}

export class PostInfo
{
  title: string = "";
  description: string = "";
  game: string = "";
  game_mode: string = "";
  rank: string = "";
  region?: Region;
  platform?: Platform;
  language?: Language;
  age_range?: AgeRange;
  gender?: Gender;
}
