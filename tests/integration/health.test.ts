import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";

const db = vi.hoisted(() => ({ $queryRaw: vi.fn() }));

vi.mock("../../src/lib/prisma", () => ({ prisma: db }));

import app from "../../src/app";

describe("GET /health", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("baza cavab verirsə 200", async () => {
    db.$queryRaw.mockResolvedValue([{ "?column?": 1 }]);

    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: "ok", db: "ok" });
  });

  it("baza cavab vermirsə 503 — 500 yox", async () => {
    db.$queryRaw.mockRejectedValue(new Error("Can't reach database server"));

    const res = await request(app).get("/health");

    expect(res.status).toBe(503);
    expect(res.body).toEqual({ status: "error", db: "down" });
  });
});
