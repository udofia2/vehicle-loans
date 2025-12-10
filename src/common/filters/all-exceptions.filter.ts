import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggerService } from '../services/logger.service';
import { ERROR_MESSAGES } from '../constants/error-messages.constants';

@Injectable()
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {
    this.logger = new LoggerService('AllExceptionsFilter');
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string = ERROR_MESSAGES.INTERNAL_SERVER_ERROR;
    let errors: any = null;

    // Handle HTTP exceptions
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || responseObj.error || message;
        errors = responseObj.errors || null;
      }
    }
    // Handle database errors
    else if (this.isDatabaseError(exception)) {
      status = HttpStatus.BAD_REQUEST;
      message = this.getDatabaseErrorMessage(exception);
    }
    // Handle validation errors
    else if (this.isValidationError(exception)) {
      status = HttpStatus.UNPROCESSABLE_ENTITY;
      const validationResult = this.getValidationErrorDetails(exception);
      message = validationResult.message;
      errors = validationResult.errors;
    }
    // Handle other known error types
    else if (exception instanceof Error) {
      message = exception.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR;

      // Log the full error for debugging
      this.logger.error(
        `Unhandled error: ${exception.message}`,
        exception.stack,
      );
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
      ...(process.env.NODE_ENV === 'development' && {
        stack: exception instanceof Error ? exception.stack : undefined,
      }),
    };

    // Log the error
    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(status).json(errorResponse);
  }

  private isDatabaseError(exception: unknown): boolean {
    if (!(exception instanceof Error)) return false;

    const message = exception.message.toLowerCase();
    return (
      message.includes('sqlite') ||
      message.includes('database') ||
      message.includes('constraint') ||
      message.includes('foreign key') ||
      message.includes('unique constraint') ||
      exception.constructor.name.includes('QueryFailedError') ||
      exception.constructor.name.includes('EntityNotFoundError')
    );
  }

  private getDatabaseErrorMessage(exception: unknown): string {
    if (!(exception instanceof Error))
      return ERROR_MESSAGES.DATABASE.CONNECTION_FAILED;

    const message = exception.message.toLowerCase();

    if (
      message.includes('unique constraint') ||
      message.includes('duplicate')
    ) {
      return ERROR_MESSAGES.DATABASE.DUPLICATE_ENTRY;
    }
    if (message.includes('foreign key')) {
      return ERROR_MESSAGES.DATABASE.FOREIGN_KEY_VIOLATION;
    }
    if (message.includes('not found')) {
      return ERROR_MESSAGES.NOT_FOUND;
    }
    if (message.includes('data too long')) {
      return ERROR_MESSAGES.DATABASE.DATA_TOO_LONG;
    }

    return ERROR_MESSAGES.DATABASE.CONNECTION_FAILED;
  }

  private isValidationError(exception: unknown): boolean {
    if (!(exception instanceof Error)) return false;

    return (
      exception.constructor.name.includes('ValidationError') ||
      exception.constructor.name.includes('BadRequestException') ||
      exception.message.includes('validation') ||
      exception.message.includes('must be') ||
      exception.message.includes('should not be empty')
    );
  }

  private getValidationErrorDetails(exception: unknown): {
    message: string;
    errors: any;
  } {
    if (!(exception instanceof Error)) {
      return {
        message: ERROR_MESSAGES.VALIDATION.INVALID_FORMAT,
        errors: null,
      };
    }

    // If it's a class-validator error, try to parse the validation errors
    try {
      const errorMessage = exception.message;

      // Check if it's a JSON string with validation errors
      if (errorMessage.startsWith('[') || errorMessage.startsWith('{')) {
        const parsedErrors = JSON.parse(errorMessage);
        return {
          message: ERROR_MESSAGES.UNPROCESSABLE_ENTITY,
          errors: parsedErrors,
        };
      }
    } catch {
      // If parsing fails, return the original message
    }

    return {
      message: exception.message || ERROR_MESSAGES.VALIDATION.INVALID_FORMAT,
      errors: null,
    };
  }
}
