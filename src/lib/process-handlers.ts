export function registerProcessHandlers(): void {
  process.on("unhandledRejection", (reason) => {
    console.error("[FATAL] Tutulmamış rejection:", reason);
    process.exit(1);
  });

  process.on("uncaughtException", (err) => {
    console.error("[FATAL] Tutulmamış xəta:", err);
    process.exit(1);
  });
}
