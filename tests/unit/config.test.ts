import { describe, expect, it } from "vitest";
import { parseEnv } from "../../src/config";

const valid = {
  DATABASE_URL: "postgresql://postgres:password@127.0.0.1:5432/kitab",
  JWT_SECRET: "bu-test-ucun-otuz-iki-simvoldan-uzun-secret",
};

describe("parseEnv", () => {
  it("düzgün env-dən config qaytarır, default-ları doldurur", () => {
    const config = parseEnv(valid);

    expect(config.PORT).toBe(3000);
    expect(config.NODE_ENV).toBe("development");
    expect(config.CORS_ORIGINS).toEqual([]);
    expect(config.TRUST_PROXY).toBeUndefined();
  });

  it("çatışmayan dəyişənlərin hamısını birdən göstərir", () => {
    expect(() => parseEnv({})).toThrow(/DATABASE_URL yoxdur[\s\S]*JWT_SECRET yoxdur/);
  });

  it("qısa JWT_SECRET-i rədd edir", () => {
    expect(() => parseEnv({ ...valid, JWT_SECRET: "qisa" })).toThrow("ən azı 32 simvol");
  });

  it(".env.example-dəki nümunə secret-i rədd edir", () => {
    const env = { ...valid, JWT_SECRET: "BURAYA-openssl-rand-base64-32-NETICESINI-YAZIN" };
    expect(() => parseEnv(env)).toThrow("nümunədir");
  });

  it("PORT və TRUST_PROXY rəqəm olmalıdır", () => {
    expect(() => parseEnv({ ...valid, PORT: "abc" })).toThrow("PORT rəqəm olmalıdır");
    expect(() => parseEnv({ ...valid, TRUST_PROXY: "true" })).toThrow("TRUST_PROXY rəqəm olmalıdır");
  });

  it("mətnləri tipə çevirir: PORT rəqəm, CORS_ORIGINS massiv", () => {
    const config = parseEnv({
      ...valid,
      PORT: "8080",
      TRUST_PROXY: "1",
      CORS_ORIGINS: "http://localhost:5173/, https://kitabxana.az",
    });

    expect(config.PORT).toBe(8080);
    expect(config.TRUST_PROXY).toBe(1);
    expect(config.CORS_ORIGINS).toEqual(["http://localhost:5173", "https://kitabxana.az"]);
  });

  it("postgres:// ünvanını da qəbul edir, mysql:// yox", () => {
    expect(() => parseEnv({ ...valid, DATABASE_URL: "postgres://u:p@host/db" })).not.toThrow();
    expect(() => parseEnv({ ...valid, DATABASE_URL: "mysql://u:p@host/db" })).toThrow("postgresql://");
  });
});
