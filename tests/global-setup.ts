import { execSync } from "node:child_process";
import { loadTestEnv } from "./test-env";

export default function setup() {
  const env = loadTestEnv();

  execSync("npx prisma migrate deploy", {
    stdio: "inherit",
    env: { ...process.env, ...env },
  });
}
