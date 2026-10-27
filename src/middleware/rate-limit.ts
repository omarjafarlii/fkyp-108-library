import { rateLimit } from "express-rate-limit";
import { AppError } from "../lib/errors";

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  skipSuccessfulRequests: true,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(new AppError("Çox sayda uğursuz cəhd. 15 dəqiqə sonra yenidən yoxlayın", 429, "TOO_MANY_REQUESTS"));
  },
});

export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 3,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(new AppError("Bu IP-dən çox qeydiyyat. 1 saat sonra yenidən yoxlayın", 429, "TOO_MANY_REQUESTS"));
  },
});
