import { readFile } from "node:fs/promises";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../../src/app";
import { prisma } from "../../src/lib/prisma";
import { MAX_COVER_SIZE } from "../../src/lib/upload";
import { resetDb } from "../helpers/db";
import { createBook, createUser } from "../helpers/factories";
import { bearer } from "../helpers/auth";
import { clearUploads, uploadedFiles } from "../helpers/uploads";

const PNG = await readFile("tests/fixtures/cover.png");

describe("POST /books/:id/cover", () => {
  beforeEach(async () => {
    await resetDb();
    await clearUploads();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("sahib PNG yükləyir — fayl saxlanılır və URL-dən açılır", async () => {
    const owner = await createUser();
    const book = await createBook({ ownerId: owner.id });

    const res = await request(app)
      .post(`/books/${book.id}/cover`)
      .set("Authorization", bearer("USER", owner.id))
      .attach("cover", PNG, { filename: "cover.png", contentType: "image/png" });

    expect(res.status).toBe(200);
    expect(res.body.coverUrl).toMatch(/^\/uploads\/.+\.png$/);
    expect(await uploadedFiles()).toHaveLength(1);

    const image = await request(app).get(res.body.coverUrl);
    expect(image.status).toBe(200);
    expect(image.headers["content-type"]).toBe("image/png");
  });

  it("token olmadan 401 — fayl yazılmır", async () => {
    const book = await createBook();

    const res = await request(app)
      .post(`/books/${book.id}/cover`)
      .attach("cover", PNG, { filename: "cover.png", contentType: "image/png" });

    expect(res.status).toBe(401);
    expect(await uploadedFiles()).toHaveLength(0);
  });

  it("başqasının kitabı 404 — fayl silinir", async () => {
    const book = await createBook();
    const stranger = await createUser();

    const res = await request(app)
      .post(`/books/${book.id}/cover`)
      .set("Authorization", bearer("USER", stranger.id))
      .attach("cover", PNG, { filename: "cover.png", contentType: "image/png" });

    expect(res.status).toBe(404);
    expect(await uploadedFiles()).toHaveLength(0);
  });

  it("şəkil olmayan tip 400", async () => {
    const owner = await createUser();
    const book = await createBook({ ownerId: owner.id });

    const res = await request(app)
      .post(`/books/${book.id}/cover`)
      .set("Authorization", bearer("USER", owner.id))
      .attach("cover", Buffer.from("salam"), { filename: "note.txt", contentType: "text/plain" });

    expect(res.status).toBe(400);
  });

  it("2 MB-dan böyük fayl 413 — fayl qalmır", async () => {
    const owner = await createUser();
    const book = await createBook({ ownerId: owner.id });
    const big = Buffer.concat([PNG, Buffer.alloc(MAX_COVER_SIZE)]);

    const res = await request(app)
      .post(`/books/${book.id}/cover`)
      .set("Authorization", bearer("USER", owner.id))
      .attach("cover", big, { filename: "big.png", contentType: "image/png" });

    expect(res.status).toBe(413);
    expect(res.body.error.code).toBe("FILE_TOO_LARGE");
    expect(await uploadedFiles()).toHaveLength(0);
  });

  it("image/png kimi göndərilən .exe 400 — fayl silinir", async () => {
    const owner = await createUser();
    const book = await createBook({ ownerId: owner.id });
    const exe = Buffer.from("MZ fake windows program");

    const res = await request(app)
      .post(`/books/${book.id}/cover`)
      .set("Authorization", bearer("USER", owner.id))
      .attach("cover", exe, { filename: "virus.png", contentType: "image/png" });

    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe("Faylın məzmunu şəkil deyil");
    expect(await uploadedFiles()).toHaveLength(0);
  });

  it("eyni adlı iki fayl bir-birini əvəz etmir", async () => {
    const owner = await createUser();
    const first = await createBook({ ownerId: owner.id });
    const second = await createBook({ ownerId: owner.id });
    const auth = bearer("USER", owner.id);

    const a = await request(app)
      .post(`/books/${first.id}/cover`)
      .set("Authorization", auth)
      .attach("cover", PNG, { filename: "cover.png", contentType: "image/png" });
    const b = await request(app)
      .post(`/books/${second.id}/cover`)
      .set("Authorization", auth)
      .attach("cover", PNG, { filename: "cover.png", contentType: "image/png" });

    expect(a.body.coverUrl).not.toBe(b.body.coverUrl);
    expect(await uploadedFiles()).toHaveLength(2);
  });
});
