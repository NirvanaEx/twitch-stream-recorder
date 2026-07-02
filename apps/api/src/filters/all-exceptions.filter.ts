import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    // A media stream that fails mid-flight has already sent its headers;
    // trying to write a JSON error on top would throw inside the filter.
    if (response.headersSent) {
      this.logger.error(
        exception instanceof Error ? exception.message : String(exception),
        exception instanceof Error ? exception.stack : undefined,
      );
      try {
        response.destroy();
      } catch {
        // The socket is already gone.
      }
      return;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();

      this.logger.error(
        `HTTP exception ${status}: ${
          typeof payload === "string" ? payload : JSON.stringify(payload)
        }`,
        exception.stack,
      );

      response.status(status).json(payload);
      return;
    }

    const status = HttpStatus.INTERNAL_SERVER_ERROR;
    const error = exception instanceof Error ? exception : new Error(String(exception));

    this.logger.error(error.message, error.stack);

    response.status(status).json({
      statusCode: status,
      message: error.message,
      stack: process.env.NODE_ENV === "production" ? undefined : error.stack,
    });
  }
}
