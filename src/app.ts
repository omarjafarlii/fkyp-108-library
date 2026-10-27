import express from "express";
import helmet from "helmet";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import authorRoutes from "./routes/author.routes";
import authRoutes from "./routes/auth.routes";
import adminRoutes from "./routes/admin.routes";
import meRoutes from "./routes/me.routes";
import bookRoutes from "./routes/book.routes";
import loanRoutes from "./routes/loan.routes";
import debugRoutes from "./routes/debug.routes";
import { requestId } from "./middleware/request-id";
import { timing } from "./middleware/timing";
import { errorHandler, notFound } from "./middleware/error-handler";
import { prisma } from "./lib/prisma";
import { UPLOAD_DIR } from "./lib/upload";
import { config } from "./config";
import { generateOpenApiDocument } from "./docs/openapi";

const app = express();
const openApiDocument = generateOpenApiDocument();

if (config.TRUST_PROXY !== undefined) {
  app.set("trust proxy", config.TRUST_PROXY);
}

app.use(requestId);
app.use(timing);
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      directives: {
        // Lokal şəbəkədə (http://192.168...) brauzer /docs fayllarını https-ə çevirməsin.
        // Production-da sayt onsuz da https-dədir — orada qalsın.
        upgradeInsecureRequests: config.NODE_ENV === "production" ? [] : null,
      },
    },
  }),
);
app.use(cors({ origin: config.CORS_ORIGINS }));
app.use(express.json());
app.use("/uploads", express.static(UPLOAD_DIR));

app.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", db: "ok", uptime: Math.round(process.uptime()) });
  } catch {
    res.status(503).json({ status: "error", db: "down" });
  }
});

app.get("/openapi.json", (_req, res) => {
  res.json(openApiDocument);
});
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));

app.use("/authors", authorRoutes);
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/me", meRoutes);
app.use("/books", bookRoutes);
app.use("/loans", loanRoutes);
app.use("/debug", debugRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
