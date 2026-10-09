const { test } = require("node:test");
const assert = require("node:assert/strict");
const vm = require("node:vm");
const { readFileSync } = require("node:fs");
const path = require("node:path");
// Stub only external authentication/storage; exercise real Express HTTP routing.
function makeApi({
  query = async () => ({ rows: [] }),
  update = async () => ({ id: "host", publicMetadata: {} }),
} = {}) {
  const filename = path.resolve(__dirname, "../server.js");
  const sandbox = {
    module: { exports: {} },
    process,
    console: { log() {}, warn() {}, error() {} },
    require(name) {
      if (name === "./db") return { query };
      if (name === "dotenv") return { config() {} };
      if (name === "./game-config") return require("../game-config");
      if (name === "@clerk/express")
        return {
          clerkMiddleware: () => (req, res, next) => next(),
          getAuth: (req) => ({ userId: req.headers["x-test-user"] }),
          clerkClient: {
            users: {
              updateUserMetadata: update,
              getUser: async () => ({ username: "Host" }),
            },
          },
        };
      return require(name);
    },
  };
  vm.runInNewContext(readFileSync(filename, "utf8"), sandbox, { filename });
  return sandbox.module.exports;
}
async function request(t, app, route, options = {}) {
  const server = app.listen(0, "127.0.0.1");
  t.after(() => new Promise((resolve) => server.close(resolve)));
  await new Promise((resolve) => server.once("listening", resolve));
  const response = await fetch(
    `http://127.0.0.1:${server.address().port}${route}`,
    {
      ...options,
      headers: { "Content-Type": "application/json", ...options.headers },
    },
  );
  return { status: response.status, body: await response.json() };
}
test("database outage is a 503, not a successful empty feed", async (t) => {
  const result = await request(
    t,
    makeApi({
      query: async () => {
        throw Error("offline");
      },
    }),
    "/api/posts",
  );
  assert.equal(result.status, 503);
  assert.match(result.body.error, /Database unavailable/);
});
test("metadata write requires sign-in", async (t) => {
  const result = await request(t, makeApi(), "/api/users/metadata", {
    method: "POST",
    body: JSON.stringify({ publicMetadata: {} }),
  });
  assert.equal(result.status, 401);
});
test("failed Clerk metadata save does not claim success", async (t) => {
  const result = await request(
    t,
    makeApi({
      update: async () => {
        throw Error("unavailable");
      },
    }),
    "/api/users/metadata",
    {
      method: "PATCH",
      headers: { "x-test-user": "host" },
      body: JSON.stringify({ publicMetadata: { setup_complete: true } }),
    },
  );
  assert.equal(result.status, 502);
});
for (const route of ["requests", "accept", "decline"]) {
  test(`non-host cannot manage ${route}`, async (t) => {
    let calls = 0;
    const result = await request(
      t,
      makeApi({
        query: async () => {
          calls++;
          return { rows: [{ clerk_id: "host" }] };
        },
      }),
      `/api/posts/1/${route}`,
      {
        method: route === "requests" ? "GET" : "POST",
        headers: { "x-test-user": "intruder" },
        ...(route === "requests"
          ? {}
          : { body: JSON.stringify({ clerk_id: "player" }) }),
      },
    );
    assert.equal(result.status, 403);
    assert.equal(calls, 1);
  });
}
test("accept requires a pending request and an available lobby", async (t) => {
  let calls = 0;
  const app = makeApi({
    query: async (sql, values) => {
      if (++calls === 1) return { rows: [{ clerk_id: "host" }] };
      assert.match(sql, /joined = FALSE/);
      assert.match(sql, /EXISTS.*join_requests/s);
      assert.deepEqual(Array.from(values), ["player", "1", "host"]);
      return { rows: [] };
    },
  });
  const result = await request(t, app, "/api/posts/1/accept", {
    method: "POST",
    headers: { "x-test-user": "host" },
    body: JSON.stringify({ clerk_id: "player" }),
  });
  assert.equal(result.status, 409);
});
test("messages fail when PostgreSQL cannot persist them", async (t) => {
  const result = await request(
    t,
    makeApi({
      query: async () => {
        throw Error("offline");
      },
    }),
    "/api/messages",
    {
      method: "POST",
      headers: { "x-test-user": "host" },
      body: JSON.stringify({ receiverId: "player", content: "Hello" }),
    },
  );
  assert.equal(result.status, 503);
});
