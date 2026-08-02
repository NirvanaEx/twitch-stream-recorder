import "reflect-metadata";
import { Logger, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { sep } from "node:path";
import { AllExceptionsFilter } from "./filters/all-exceptions.filter";
import { AppModule } from "./modules/app.module";

/**
 * A hiccup on the Telegram transport, raised outside anything we await.
 *
 * gramjs settles a request from its own receive loop, so a `-503 Timeout` on
 * `upload.GetFile` — or a dropped socket — surfaces as an unhandled rejection
 * with no caller left to catch it, and Node takes the process down. One slow
 * chunk therefore killed the whole API: every page answered 502 until the
 * container came back, which is what "nothing opens at all" looked like. The
 * download paths retry these themselves (MAX_CHUNK_RETRIES) and the streams
 * that were mid-flight are already given up on, so losing one must not be
 * fatal. Everything else still crashes the process, on purpose.
 */
function isTelegramTransportError(reason: unknown): boolean {
  if (!(reason instanceof Error)) {
    return false;
  }

  return (
    reason.constructor?.name === "RPCError" ||
    (reason.stack ?? "").includes(`${sep}node_modules${sep}telegram${sep}`)
  );
}

function guardTelegramTransport() {
  process.on("unhandledRejection", (reason) => {
    if (!isTelegramTransportError(reason)) {
      throw reason;
    }

    Logger.warn(
      `Ignored a Telegram transport failure: ${
        reason instanceof Error ? reason.message : String(reason)
      }`,
      "Telegram",
    );
  });

  process.on("uncaughtException", (error: unknown) => {
    if (!isTelegramTransportError(error)) {
      Logger.error(
        error instanceof Error ? (error.stack ?? error.message) : String(error),
        undefined,
        "Bootstrap",
      );
      process.exit(1);
    }

    Logger.warn(
      `Ignored a Telegram transport failure: ${(error as Error).message}`,
      "Telegram",
    );
  });
}

async function bootstrap() {
  guardTelegramTransport();

  const app = await NestFactory.create(AppModule, {
    cors: true,
  });

  app.enableShutdownHooks();
  app.setGlobalPrefix("api");
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());

  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port);

  Logger.log(`API listening on port ${port}`, "Bootstrap");
}

void bootstrap();
