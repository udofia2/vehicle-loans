import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Injectable,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggerService } from '../services/logger.service';

@Injectable()
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {
    this.logger = new LoggerService('HttpExceptionFilter');
  }

  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let message: string;
    let errors: any = null;

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null
    ) {
      const responseObj = exceptionResponse as any;
      message = responseObj.message || responseObj.error || exception.message;
      errors = responseObj.errors || responseObj.message;

      // Handle validation pipe errors
      if (Array.isArray(responseObj.message)) {
        errors = responseObj.message;
        message = 'Validation failed';
      }
    } else {
      message = exception.message;
    }

    // Create standardized error response
    const errorResponse = {
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      ...(errors && { errors }),
    };

    // Log the HTTP exception
    this.logger.warn(
      `HTTP Exception - ${request.method} ${request.url} - ${status} - ${message}`,
    );

    // Additional logging for specific status codes
    if (status >= 500) {
      this.logger.error(
        `Server Error - ${request.method} ${request.url}`,
        exception.stack,
      );
    } else if (status === 401 || status === 403) {
      this.logger.warn(
        `Authentication/Authorization Error - ${request.method} ${request.url} - User: ${this.getUserInfo(request)}`,
      );
    } else if (status === 404) {
      this.logger.debug(
        `Resource Not Found - ${request.method} ${request.url}`,
      );
    }

    response.status(status).json(errorResponse);
  }

  private getUserInfo(request: Request): string {
    // Extract user information from request if available
    const user = (request as any).user;
    if (user) {
      return user.id || user.email || user.username || 'Unknown User';
    }

    // Fallback to IP address
    return request.ip || request.connection.remoteAddress || 'Unknown IP';
  }
}
