import { Injectable } from '@angular/core';
import { Post } from '../Post';

// In-memory fixtures for the opt-in design-preview configuration only.
// The production provider remains ApiService, with Clerk and the real API.
@Injectable()
export class PreviewApiService {
  private currentId = 'preview-you';
  private users: Record<string, any> = {
    'preview-you': {
      id: 'preview-you',
      username: 'You',
      publicMetadata: {
        setup_complete: true,
        preferred_games: ['Valorant', 'Minecraft'],
        socials: {
          region: 'EU',
          language: 'English',
          bio: 'A few games after college. Here for good company and a relaxed match.',
          discord: 'your-discord',
        },
      },
    },
    'preview-alex': {
      id: 'preview-alex',
      username: 'Alex',
      publicMetadata: {
        socials: {
          region: 'EU',
          language: 'English',
          bio: 'A relaxed game, a bit of teamwork, and no pressure.',
          discord: 'alex-demo',
        },
      },
    },
    'preview-mira': {
      id: 'preview-mira',
      username: 'Mira',
      publicMetadata: { socials: { region: 'EU', language: 'English' } },
    },
    'preview-jules': {
      id: 'preview-jules',
      username: 'Jules',
      publicMetadata: { socials: { region: 'NA', language: 'English' } },
    },
  };
  private posts: any[] = [
    {
      id: 1,
      clerk_id: 'preview-alex',
      title: 'A few ranked games, good vibes',
      description:
        'Looking for a duo with a mic. A little teamwork, no pressure. Let’s see how the evening goes.',
      game: 'Valorant',
      game_mode: 'Competitive',
      rank: 'Gold',
      region: 'EU',
      language: 'English',
      platform: 'PC',
    },
    {
      id: 2,
      clerk_id: 'preview-mira',
      title: 'Building something together',
      description:
        'Starting a fresh survival world. Bring your ideas; I’ll bring the questionable building skills.',
      game: 'Minecraft',
      game_mode: 'Survival',
      region: 'EU',
      language: 'English',
      platform: 'PC',
    },
    {
      id: 3,
      clerk_id: 'preview-jules',
      title: 'One more match? Always.',
      description: 'Casual games and a bit of conversation. All skill levels welcome.',
      game: 'CS2',
      game_mode: 'Casual',
      region: 'NA',
      language: 'English',
      platform: 'PC',
    },
    {
      id: 4,
      clerk_id: 'preview-mira',
      title: 'Zero Build, zero stress',
      description: 'Looking for a teammate for a few evening games. Let’s keep it friendly.',
      game: 'Fortnite',
      game_mode: 'Zero Build',
      region: 'EU',
      language: 'English',
      platform: 'PlayStation',
    },
    {
      id: 5,
      clerk_id: 'preview-alex',
      title: 'A teammate for the next kickoff',
      description: 'Doubles, a little practice, and some properly chaotic goals.',
      game: 'Rocket League',
      game_mode: 'Casual',
      region: 'EU',
      language: 'English',
      platform: 'PC',
    },
    {
      id: 6,
      clerk_id: 'preview-you',
      title: 'A relaxed game after lectures',
      description: 'No need to be brilliant. Just bring a mic and a good attitude.',
      game: 'Valorant',
      game_mode: 'Unrated',
      region: 'EU',
      language: 'English',
      platform: 'PC',
    },
    {
      id: 7,
      clerk_id: 'preview-alex',
      title: 'Our evening duo',
      description: 'Planning the next game.',
      game: 'Valorant',
      region: 'EU',
      language: 'English',
      joined: true,
      accepted_clerk_id: 'preview-you',
    },
  ].map((post, i) => ({
    rank: '',
    game_mode: '',
    platform: 'PC',
    age_range: '',
    gender: '',
    joined: false,
    created_at: new Date(Date.now() - (i + 1) * 1800000).toISOString(),
    ...post,
  }));
  private requests = [
    { post_id: 2, clerk_id: 'preview-you' },
    { post_id: 6, clerk_id: 'preview-mira' },
  ];
  private messages = [
    {
      id: 1,
      sender_id: 'preview-alex',
      receiver_id: 'preview-you',
      content: 'Hey! Fancy a few games this evening?',
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 2,
      sender_id: 'preview-you',
      receiver_id: 'preview-alex',
      content: 'Sounds good. I’m around after 7 — casual or ranked?',
      created_at: new Date(Date.now() - 3000000).toISOString(),
    },
    {
      id: 3,
      sender_id: 'preview-alex',
      receiver_id: 'preview-you',
      content: 'Let’s warm up with a casual game first.',
      created_at: new Date(Date.now() - 2400000).toISOString(),
    },
  ];
  async is_signed_in() {
    return true;
  }
  async get_user_id() {
    return this.currentId;
  }
  async get_token() {
    return null;
  }
  async sign_out() {
    window.location.href = '/';
  }
  async get_user_info(id: string) {
    return this.users[id] || { id, username: 'Player', publicMetadata: {} };
  }
  async get_games(filters: Record<string, string>) {
    return this.posts
      .filter(
        (post) =>
          !post.joined &&
          Object.entries(filters).every(
            ([key, value]) => !value || post[key === 'user' ? 'clerk_id' : key] === value,
          ),
      )
      .map((post) => Post.from_json(this as any, post));
  }
  async get_game(id: number) {
    const post = this.posts.find((post) => post.id === Number(id));
    if (!post) throw new Error('Lobby not found');
    return Post.from_json(this as any, post);
  }
  async get_filter_data() {
    return {
      games: Object.fromEntries(
        ['Valorant', 'Minecraft', 'CS2', 'Fortnite', 'Rocket League'].map((name) => [
          name,
          {
            name,
            modes: ['Casual', 'Competitive', 'Survival', 'Zero Build', 'Unrated'],
            ranks: ['Unranked', 'Bronze', 'Silver', 'Gold'],
            platforms: ['PC', 'PlayStation', 'Xbox'],
          },
        ]),
      ),
      regions: ['EU', 'NA', 'Asia', 'OCE'],
      languages: ['English', 'Russian', 'Spanish'],
      age_ranges: ['Under 18', '18-25', '26-35', '36+'],
      genders: ['Male', 'Female', 'Other', 'Prefer not to say'],
    };
  }
  async get_user_requests(joined = false) {
    return this.posts
      .filter((post) =>
        joined
          ? post.joined &&
            (post.clerk_id === this.currentId || post.accepted_clerk_id === this.currentId)
          : !post.joined &&
            this.requests.some((r) => r.post_id === post.id && r.clerk_id === this.currentId),
      )
      .map((post) => Post.from_json(this as any, post));
  }
  async get_requests(id: number) {
    return this.requests.filter((r) => r.post_id === id);
  }
  async has_requested(id: number) {
    return this.requests.some((r) => r.post_id === id && r.clerk_id === this.currentId);
  }
  async request_to_join(id: number) {
    if (!(await this.has_requested(id)))
      this.requests.push({ post_id: id, clerk_id: this.currentId });
  }
  async cancel_request(id: number) {
    this.requests = this.requests.filter(
      (r) => !(r.post_id === id && r.clerk_id === this.currentId),
    );
  }
  async accept_request(id: number, userId: string) {
    const post = this.posts.find((p) => p.id === id && p.clerk_id === this.currentId);
    if (!post) throw new Error('Not your lobby');
    post.joined = true;
    post.accepted_clerk_id = userId;
  }
  async decline_request(id: number, userId: string) {
    this.requests = this.requests.filter((r) => !(r.post_id === id && r.clerk_id === userId));
  }
  async get_messages(id: string) {
    return this.messages.filter(
      (m) =>
        (m.sender_id === this.currentId && m.receiver_id === id) ||
        (m.sender_id === id && m.receiver_id === this.currentId),
    );
  }
  async send_message(id: string, content: string) {
    this.messages.push({
      id: Date.now(),
      sender_id: this.currentId,
      receiver_id: id,
      content,
      created_at: new Date().toISOString(),
    });
  }
  async post_game(info: any) {
    this.posts.unshift({
      ...info,
      id: Date.now(),
      clerk_id: this.currentId,
      created_at: new Date().toISOString(),
      joined: false,
    });
  }
  async update_game(id: number, info: any) {
    const post = this.posts.find((p) => p.id === id && p.clerk_id === this.currentId);
    if (!post) throw new Error('Not your lobby');
    Object.assign(post, info);
  }
  async delete_game(id: number) {
    this.posts = this.posts.filter((p) => !(p.id === id && p.clerk_id === this.currentId));
  }
  async update_user_metadata(metadata: any) {
    this.users[this.currentId].publicMetadata = metadata;
    return this.users[this.currentId];
  }
}
