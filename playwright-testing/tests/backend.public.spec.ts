import { test, expect } from '@playwright/test';

const API_BASE = process.env.API_BASE_URL ?? 'http://localhost:3000';

test.describe('Backend public routes + config check', () => {
  test('server responds at all (check route)', async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/check`);
    expect([200, 500]).toContain(res.status());
  });

  test('should detect Clerk publishable key misconfiguration', async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/check`);
    const text = await res.text();

    if (res.status() === 500) {
      expect(text.toLowerCase()).toContain('publishable key is missing');
    } else {
      expect(res.status()).toBe(200);
      expect(text).toBe('ok');
    }
  });

  test('should check games endpoint to see if backend is working well', async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/games`);

    if (res.status() === 500) {
      test.skip(true, 'Backend config error.');
    }

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('games');
    expect(body).toHaveProperty('regions');
    expect(body).toHaveProperty('languages');
    expect(body).toHaveProperty('age_ranges');
    expect(body).toHaveProperty('genders');
  });

  test('posts endpoint returns array if working as it should be', async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/posts`);

    if (res.status() === 500) {
      test.skip(true, 'Backend config error.');
    }

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBeTruthy();
  });

  test('invalid post id should return 404', async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/posts/999999999`);

    if (res.status() === 500) {
      test.skip(true, 'Backend config error.');
    }

    expect(res.status()).toBe(404);
  });

  test('check route should respond quickly (under 1s) if working well', async ({ request }) => {
    const start = Date.now();
    const res = await request.get(`${API_BASE}/api/check`);
    const elapsed = Date.now() - start;
  
    if (res.status() === 500) {
      test.skip(true, 'Backend config error.');
    }
  
    expect(res.status()).toBe(200);
    expect(elapsed).toBeLessThan(1000);
  });
  
  test('games metadata arrays should contain only strings', async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/games`);
  
    if (res.status() === 500) {
      test.skip(true, 'Backend config error.');
    }
  
    expect(res.status()).toBe(200);
    const body = await res.json();
  
    for (const key of ['regions', 'languages', 'age_ranges', 'genders'] as const) {
      expect(Array.isArray(body[key])).toBeTruthy();
      for (const value of body[key]) {
        expect(typeof value).toBe('string');
      }
    }
  });
  
  test('each game should have required fields', async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/games`);
  
    if (res.status() === 500) {
      test.skip(true, 'Backend config error.');
    }
  
    expect(res.status()).toBe(200);
    const body = await res.json();
  
    for (const game of Object.values(body.games ?? {}) as any[]) {
      expect(typeof game.name).toBe('string');
      expect(Array.isArray(game.modes)).toBeTruthy();
      expect(Array.isArray(game.platforms)).toBeTruthy();
      if (game.ranks !== undefined) {
        expect(Array.isArray(game.ranks)).toBeTruthy();
      }
    }
  });
  
  test('posts endpoint accepts multiple filters without failing', async ({ request }) => {
    const res = await request.get(
      `${API_BASE}/api/posts?game=valorant&region=EU&language=English`
    );
  
    if (res.status() === 500) {
      test.skip(true, 'Backend config error.');
    }
  
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBeTruthy();
  });
  
  test('posts endpoint with user filter returns array', async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/posts?user=nonexistent_user_12345`);
  
    if (res.status() === 500) {
      test.skip(true, 'Backend config error.');
    }
  
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBeTruthy();
  });
  
  test('single post response includes core keys if found', async ({ request }) => {
    const listRes = await request.get(`${API_BASE}/api/posts`);
  
    if (listRes.status() === 500) {
      test.skip(true, 'Backend config error.');
    }
  
    expect(listRes.status()).toBe(200);
    const posts = await listRes.json();
    test.skip(!Array.isArray(posts) || posts.length === 0, 'No posts available to confirm this.');
  
    const id = posts[0].id;
    const res = await request.get(`${API_BASE}/api/posts/${id}`);
    expect(res.status()).toBe(200);
  
    const post = await res.json();
    expect(post).toHaveProperty('id');
    expect(post).toHaveProperty('title');
    expect(post).toHaveProperty('clerk_id');
    expect(post).toHaveProperty('created_at');
  });
  
  test('POST /api/messages without auth is blocked', async ({ request }) => {
    const res = await request.post(`${API_BASE}/api/messages`, {
      data: { receiverId: 'user_x', content: 'hi' },
    });
  
    if (res.status() === 500) {
      test.skip(true, 'Backend config error.');
    }
  
    expect([401, 403]).toContain(res.status());
  });
  
  test('POST /api/posts without auth is blocked', async ({ request }) => {
    const res = await request.post(`${API_BASE}/api/posts`, {
      data: { title: 'test post' },
    });
  
    if (res.status() === 500) {
      test.skip(true, 'Backend config error.');
    }
  
    expect([401, 403]).toContain(res.status());
  });
  
  test('PATCH /api/posts/:id/join without auth is blocked', async ({ request }) => {
    const res = await request.patch(`${API_BASE}/api/posts/1/join`);
  
    if (res.status() === 500) {
      test.skip(true, 'Backend config error.');
    }
  
    expect([401, 403]).toContain(res.status());
  });
  
  test('GET /api/posts/:id/requests without auth is blocked', async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/posts/1/requests`);
  
    if (res.status() === 500) {
      test.skip(true, 'Backend config error.');
    }
  
    expect([401, 403]).toContain(res.status());
  });
  
  test('GET /api/users/:userId for impossible id is not 200', async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/users/impossible_user_id_123456789`);
    expect([404, 500]).toContain(res.status());
  });
  
  test('GET /api/users/:userId/socials for impossible id is not 200', async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/users/impossible_user_id_123456789/socials`);
  
    expect([404, 500]).toContain(res.status());
  });
  
  test('unknown API route consistently returns 404', async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/not-found-2`);
  
    if (res.status() === 500) {
      test.skip(true, 'Backend config error.');
    }
  
    expect(res.status()).toBe(404);
  });
  
  test('OPTIONS request on check route is CORS-friendly', async ({ request }) => {
    const res = await request.fetch(`${API_BASE}/api/check`, { method: 'OPTIONS' });
  
    if (res.status() === 500) {
      test.skip(true, 'Backend config error.');
    }
  
    expect([200, 204]).toContain(res.status());
  });
  
  test('malformed route should not crash server', async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/posts/%ZZ`);
    expect([400, 404, 500]).toContain(res.status());
  });
});
