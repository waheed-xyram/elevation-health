import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
  } from '@nestjs/common';
  
  @Catch()
  export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);
  
    catch(exception: unknown, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse();
      const request = ctx.getRequest();
  
      const status =
        exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
  
      const message =
        exception instanceof HttpException ? exception.getResponse() : exception;
  
      // ✅ Log full exception
      this.logger.error(`HTTP Status: ${status} Error: ${JSON.stringify(message)}`);
      this.logger.error(exception); // Also log stack trace if available
  
      response.status(status).json({
        statusCode: status,
        path: request.url,
        message: message,
        timestamp: new Date().toISOString(),
      });
    }
  }
  