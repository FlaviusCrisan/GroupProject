import { describe, it, expect, vi } from 'vitest';
import { PostList } from './post-list';

describe('lobby feed', () => {
  function create(get_games: any) {
    return new PostList(
      { get_games } as any,
      { detectChanges: vi.fn() } as any,
      {} as any,
      {} as any,
    );
  }
  it('distinguishes a failed API from a successful empty response', async () => {
    const feed = create(vi.fn().mockRejectedValue(new Error('offline')));
    await feed.load_posts();
    expect(feed.error).toBe(true);
    expect(feed.loading).toBe(false);
  });
  it('keeps the newest filter response when requests finish out of order', async () => {
    let first!: (value: any[]) => void;
    const feed = create(
      vi
        .fn()
        .mockImplementationOnce(() => new Promise((resolve) => (first = resolve)))
        .mockResolvedValueOnce([{ id: 2 }]),
    );
    const oldRequest = feed.load_posts();
    await feed.load_posts();
    first([{ id: 1 }]);
    await oldRequest;
    expect(feed.posts.map((post) => post.id)).toEqual([2]);
  });
});
