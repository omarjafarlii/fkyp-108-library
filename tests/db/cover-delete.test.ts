import { readFile } from "node:fs/promises";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../../src/app";
import { prisma } from "../../src/lib/prisma";
import { resetDb } from "../helpers/db";
import { createBook, createUser } from "../helpers/factories";
import { bearer } from "../helpers/auth";
import { clearUploads, uploadedFiles } from "../helpers/uploads";

const PNG = await readFile("tests/fixtures/cover.png");

describe("DELETE /books/:id/cover", () => {
  beforeEach(async () => {
    await resetDb();
    await clearUploads();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("sahib üz qabığını silir — fayl və coverUrl yox olur", async () => {
    const owner = await createUser();
    const book = await createBook({ ownerId: owner.id });
    const auth = bearer("USER", owner.id);
    await request(app)
      .post(`/books/${book.id}/cover`)
      .set("Authorization", auth)
      .attach("cover", PNG, { filename: "cover.png", contentType: "image/png" });

    const res = await request(app).delete(`/books/${book.id}/cover`).set("Authorization", auth);

    expect(res.status).toBe(204);
    expect(await uploadedFiles()).toHaveLength(0);
    const after = await prisma.book.findUniqueOrThrow({ where: { id: book.id } });
    expect(after.coverUrl).toBeNull();
  });

  it("başqasının kitabı 404 — fayl yerində qalır", async () => {
    const owner = await createUser();
    const book = await createBook({ ownerId: owner.id });
    await request(app)
      .post(`/books/${book.id}/cover`)
      .set("Authorization", bearer("USER", owner.id))
      .attach("cover", PNG, { filename: "cover.png", contentType: "image/png" });
    const stranger = await createUser();

    const res = await request(app)
      .delete(`/books/${book.id}/cover`)
      .set("Authorization", bearer("USER", stranger.id));

    expect(res.status).toBe(404);
    expect(await uploadedFiles()).toHaveLength(1);
  });

  it("üz qabığı olmayan kitab 404", async () => {
    const owner = await createUser();
    const book = await createBook({ ownerId: owner.id });

    const res = await request(app)
      .delete(`/books/${book.id}/cover`)
      .set("Authorization", bearer("USER", owner.id));

    expect(res.status).toBe(404);
    expect(res.body.error.message).toBe("Üz qabığı tapılmadı");
  });
});
