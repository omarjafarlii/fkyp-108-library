import path from "node:path";
import { randomUUID } from "node:crypto";
import multer from "multer";
import { ValidationError } from "./errors";
import { config } from "../config";

export const UPLOAD_DIR = path.resolve(config.UPLOAD_DIR);
export const MAX_COVER_SIZE = 2 * 1024 * 1024;

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
};

export const coverUpload = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (_req, file, cb) => {
      cb(null, `${randomUUID()}${EXTENSIONS[file.mimetype]}`);
    },
  }),
  limits: { fileSize: MAX_COVER_SIZE, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype in EXTENSIONS) {
      cb(null, true);
    } else {
      cb(new ValidationError("Yalnız JPEG və ya PNG şəkil yükləmək olar"));
    }
  },
});
