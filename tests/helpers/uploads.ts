import { mkdir, readdir, rm } from "node:fs/promises";
import { UPLOAD_DIR } from "../../src/lib/upload";

export async function clearUploads() {
  await rm(UPLOAD_DIR, { recursive: true, force: true });
  await mkdir(UPLOAD_DIR, { recursive: true });
}

export async function uploadedFiles() {
  return readdir(UPLOAD_DIR);
}
