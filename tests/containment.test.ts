import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";
import { createServerClient } from "@supabase/ssr";
import { NextRequest } from "next/server";
import { unstable_doesMiddlewareMatch } from "next/experimental/testing/server";
import { config } from "../src/proxy";
import { updateSession } from "../src/lib/auth/session";
import { snapshotFreshness } from "../src/lib/portfolio/freshness";
import { summarize } from "../src/lib/portfolio/import";

test("proxy matcher covers account pages, callback and dynamic slugs with file extensions", () => {
  for (const url of [
    "/dashboard",
    "/auth/callback?code=synthetic",
    "/mutual-funds/private.png",
    "/portfolio",
  ]) {
    assert.equal(
      unstable_doesMiddlewareMatch({ config, nextConfig: {}, url }),
      true,
      url,
    );
  }
  for (const url of [
    "/api/portfolio/me",
    "/_next/static/test.js",
    "/favicon.ico",
  ]) {
    assert.equal(
      unstable_doesMiddlewareMatch({ config, nextConfig: {}, url }),
      false,
      url,
    );
  }
});

const financePages = [
  "dashboard",
  "portfolio",
  "intelligence",
  "sips",
  "profile",
  "chat",
  "rebalance",
  "capital-gains",
  "tax-harvesting",
  "reports",
  "watchlist",
  "live-nav",
];
function sessionFactory(
  user: { id: string; is_anonymous?: boolean } | null,
  error: unknown = null,
) {
  return ((_url, _key, options) => ({
    auth: {
      getUser: async () => {
        options.cookies.setAll([
          {
            name: "refreshed-session",
            value: "synthetic",
            options: { httpOnly: true, path: "/", sameSite: "lax" },
          },
        ]);
        return { data: { user }, error };
      },
    },
  })) as unknown as typeof createServerClient;
}
for (const route of financePages) {
  test(`/${route} requires a verified session and permits its owner`, async () => {
    const request = () =>
      new NextRequest(`https://folio.test/${route}?view=holdings`);
    const rejected = await updateSession(request(), sessionFactory(null));
    assert.equal(rejected.status, 307);
    const redirect = new URL(rejected.headers.get("location")!);
    assert.equal(redirect.pathname, "/auth");
    assert.equal(redirect.searchParams.get("next"), `/${route}?view=holdings`);
    assert.equal(rejected.cookies.get("refreshed-session")?.value, "synthetic");
    assert.equal(rejected.headers.get("cache-control"), "private, no-store");
    const accepted = await updateSession(
      request(),
      sessionFactory({ id: "owner-a" }),
    );
    assert.equal(accepted.headers.get("location"), null);
    assert.equal(accepted.cookies.get("refreshed-session")?.httpOnly, true);
  });
}
test("invalid/anonymous sessions fail closed and callback paths are never intercepted", async () => {
  for (const factory of [
    sessionFactory({ id: "a" }, new Error("expired")),
    sessionFactory({ id: "a", is_anonymous: true }),
  ]) {
    assert.equal(
      (
        await updateSession(
          new NextRequest("https://folio.test/dashboard"),
          factory,
        )
      ).status,
      307,
    );
  }
  for (const route of ["/auth/callback?code=synthetic", "/auth/session"]) {
    for (const user of [null, { id: "a" }]) {
      const result = await updateSession(
        new NextRequest("https://folio.test" + route),
        sessionFactory(user),
      );
      assert.equal(result.headers.get("location"), null);
      assert.equal(result.cookies.get("refreshed-session")?.value, "synthetic");
    }
  }
});
test("sign-in redirects retain refreshed cookies and reject external/auth-loop destinations", async () => {
  for (const next of ["//evil.test", "/auth/callback", "https://evil.test"]) {
    const result = await updateSession(
      new NextRequest(
        "https://folio.test/auth?next=" + encodeURIComponent(next),
      ),
      sessionFactory({ id: "a" }),
    );
    assert.equal(
      result.headers.get("location"),
      "https://folio.test/dashboard",
    );
    assert.equal(result.cookies.get("refreshed-session")?.value, "synthetic");
  }
  const result = await updateSession(
    new NextRequest("https://folio.test/auth?next=/portfolio"),
    sessionFactory({ id: "a" }),
  );
  assert.equal(result.headers.get("location"), "https://folio.test/portfolio");
});

type Handler = (request?: Request) => Response | Promise<Response>;
// Execute real route bodies with explicit local dependencies; unexpected I/O fails the test.
function loadRoute(route: string, overrides: Record<string, unknown> = {}) {
  const exports: Record<string, Handler> = {};
  const json = (data: unknown, status = 200) => Response.json(data, { status });
  const http = { json, ...overrides };
  vm.runInNewContext(
    ts.transpileModule(readFileSync(`src/app/api/${route}/route.ts`, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
    {
      exports,
      Request,
      Response,
      require: (name: string) => {
        if (name === "@/lib/server/http") return http;
        if (name === "@/lib/server/imports") return overrides;
        throw new Error("Unexpected route dependency: " + name);
      },
      fetch: () => {
        throw new Error("Provider calls are forbidden in containment tests");
      },
      process: { env: {} },
    },
  );
  return exports;
}
test("retired endpoints return 410 for GET and POST without auth, database or provider work", async () => {
  for (const route of [
    "auth-otp",
    "upload",
    "upload-portfolio",
    "cas-parse",
    "pf/load",
    "pf/save",
    "supabase-test",
    "casparser/token",
    "upload-handler",
    "claude",
    "ai/insights",
  ]) {
    const handlers = loadRoute(route);
    for (const method of ["GET", "POST"]) {
      const result = await handlers[method](
        new Request("https://folio.test/api/" + route, { method }),
      );
      assert.equal(result.status, 410, route);
      const body = await result.json();
      for (const key of ["access_token", "token", "otp", "link", "credentials"])
        assert.equal(body[key], undefined);
    }
  }
});
test("chat denies unauthenticated requests and stays unavailable without any model call", async () => {
  for (const signedIn of [false, true]) {
    const route = loadRoute("chat", {
      authorized: async () => {
        if (!signedIn) throw new Error("unauthorized");
        return {};
      },
      failure: () =>
        Response.json({ error: "Please sign in again." }, { status: 401 }),
    });
    const result = await route.POST(
      new Request("https://folio.test/api/chat", { method: "POST" }),
    );
    assert.equal(result.status, signedIn ? 503 : 401);
  }
});
test("fund provider lookup is blocked before fetch when authentication or durable quota fails", async () => {
  for (const deniedBy of ["auth", "budget"]) {
    const route = loadRoute("mf", {
      authorized: async () => {
        if (deniedBy === "auth") throw new Error("denied");
        return { db: {} };
      },
      budget: async () => {
        throw new Error("denied");
      },
      failure: () =>
        Response.json(
          { error: "denied" },
          { status: deniedBy === "auth" ? 401 : 429 },
        ),
    });
    const result = await route.GET(
      new Request("https://folio.test/api/mf?action=latest&schemeCode=100001"),
    );
    assert.equal(result.status, deniedBy === "auth" ? 401 : 429);
  }
});
test("staging derives ownership from the verified user, ignoring attacker-supplied userId", async () => {
  let owner: unknown;
  const route = loadRoute("casparser/save", {
    authorized: async () => ({ db: {}, user: { id: "verified-owner" } }),
    readJson: (r: Request) => r.json(),
    budget: async () => {},
    stageImport: async (_db: unknown, id: unknown) => {
      owner = id;
      return { draftId: "synthetic" };
    },
  });
  const result = await route.POST(
    new Request("https://folio.test/api/casparser/save", {
      method: "POST",
      body: JSON.stringify({ consent: true, userId: "victim", data: {} }),
    }),
  );
  assert.equal(result.status, 200);
  assert.equal(owner, "verified-owner");
});
test("staging does not write before authentication or after budget failure", async () => {
  for (const deniedBy of ["auth", "budget"]) {
    let staged = false;
    const route = loadRoute("casparser/save", {
      authorized: async () => {
        if (deniedBy === "auth") throw new Error("denied");
        return { db: {}, user: { id: "a" } };
      },
      readJson: (r: Request) => r.json(),
      budget: async () => {
        throw new Error("denied");
      },
      stageImport: async () => {
        staged = true;
      },
      failure: () => Response.json({ error: "denied" }, { status: 401 }),
    });
    await route.POST(
      new Request("https://folio.test/api/casparser/save", {
        method: "POST",
        body: JSON.stringify({ consent: true, data: {} }),
      }),
    );
    assert.equal(staged, false);
  }
});
test("empty and partially dated snapshots never fabricate complete values or freshness", () => {
  assert.equal(summarize([]).totalCurrent, null);
  assert.equal(summarize([]).totalInvested, null);
  assert.equal(snapshotFreshness([], "2026-10-13").valuationDate, null);
  const partial = snapshotFreshness(
    [{ nav_date: "2026-10-10" }, {}],
    "2026-10-13",
  );
  assert.equal(partial.valuationDate, null);
  assert.equal(partial.missingDates, 1);
  const stale = snapshotFreshness(
    [{ nav_date: "2026-06-17" }, { nav_date: "2026-10-13" }],
    "2026-10-13",
  );
  assert.equal(stale.stale, true);
  assert.equal(stale.mixedDates, true);
  assert.equal(
    snapshotFreshness([{ nav_date: "2026-10-06" }], "2026-10-13").stale,
    false,
  );
  assert.equal(
    snapshotFreshness(
      [{ nav_date: "2027-01-01" }, { nav_date: "2026-02-30" }],
      "2026-10-13",
    ).missingDates,
    2,
  );
});
test("production source contains no fictional portfolio or active privileged caller-ID writes", () => {
  function files(dir: string): string[] {
    return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
      e.isDirectory()
        ? files(path.join(dir, e.name))
        : /\.(ts|tsx)$/.test(e.name)
          ? [path.join(dir, e.name)]
          : [],
    );
  }
  for (const file of [...files("src/app"), ...files("src/components")]) {
    const source = readFileSync(file, "utf8");
    assert(
      !/Aarav|PORTFOLIO_CONTEXT|synced 2 min ago|sparkPath|demoPortfolio/.test(
        source,
      ),
      file,
    );
    if (file.endsWith("route.ts"))
      assert(
        !/createAdminClient|SUPABASE_SERVICE_ROLE_KEY|body\.userId|form\.get\(["']userId/.test(
          source,
        ),
        file,
      );
  }
  assert(
    !readFileSync("src/app/api/casparser/token/route.ts", "utf8").includes(
      "fetch(",
    ),
  );
});
