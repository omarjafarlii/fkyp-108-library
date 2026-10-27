import { describe, expect, it } from "vitest";
import request from "supertest";
import app from "../../src/app";
import { bearer } from "../helpers/auth";

describe("Qorunan route-lar", () => {
  it("token olmadan borrow 401 qaytarır", async () => {
    const res = await request(app).post("/books/1/borrow");

    expect(res.status).toBe(401);
    expect(res.body.error.message).toBe("Token təqdim edilməyib");
  });

  it("saxta token 401 qaytarır", async () => {
    const res = await request(app)
      .post("/books/1/borrow")
      .set("Authorization", "Bearer salam.necesen.yaxsi");

    expect(res.status).toBe(401);
    expect(res.body.error.message).toBe("Token etibarsızdır");
  });

  it("USER admin route-a girəndə 403 alır", async () => {
    const res = await request(app).get("/admin/stats").set("Authorization", bearer("USER"));

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("FORBIDDEN");
  });

  it("ADMIN admin route-a girə bilir", async () => {
    const res = await request(app).get("/admin/stats").set("Authorization", bearer("ADMIN"));

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ users: 42 });
  });

  it('alg: "none" ilə saxtalaşdırılmış ADMIN token 401 alır', async () => {
    const header = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString("base64url");
    const payload = Buffer.from(
      JSON.stringify({ sub: 1, email: "haker@test.az", role: "ADMIN" }),
    ).toString("base64url");
    const forged = `${header}.${payload}.`;

    const res = await request(app).get("/admin/stats").set("Authorization", `Bearer ${forged}`);

    expect(res.status).toBe(401);
  });
});
