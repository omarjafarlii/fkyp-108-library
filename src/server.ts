import "dotenv/config";
import { config } from "./config";
import app from "./app";
import { prisma } from "./lib/prisma";
import { registerProcessHandlers } from "./lib/process-handlers";

registerProcessHandlers();

const server = app.listen(config.PORT, (error) => {
  if (error) {
    console.error(`Port ${config.PORT} açıla bilmədi: ${error.message}`);
    process.exit(1);
  }
  console.log(`http://127.0.0.1:${config.PORT}`);
});

let shuttingDown = false;

function shutdown(signal: NodeJS.Signals) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`${signal} alındı — yeni request qəbul edilmir, açıq request-lər bitirilir...`);

  const forceExit = setTimeout(() => {
    console.error("10 saniyədə bitmədi — məcburi çıxış");
    process.exit(1);
  }, 10_000);
  forceExit.unref();

  server.close(async () => {
    await prisma.$disconnect();
    console.log("Server və baza bağlantısı bağlandı. Çıxış.");
    process.exit(0);
  });
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
