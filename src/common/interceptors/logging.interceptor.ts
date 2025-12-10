import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { LoggerService } from '../services/logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger: LoggerService;

  constructor(logger: LoggerService) {
    this.logger = logger;
    this.logger.setContext('HTTP');
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() === 'http') {
      const request = context.switchToHttp().getRequest<Request>();
      const response = context.switchToHttp().getResponse<Response>();
      const { method, url, body, query, params, headers } = request;
      const userAgent = headers['user-agent'] || '';
      const ip = request.ip || request.connection.remoteAddress;

      const startTime = Date.now();

      // Log incoming request
      this.logRequest(method, url, body, query, params, ip, userAgent);

      return next.handle().pipe(
        tap({
          next: (responseBody) => {
            const endTime = Date.now();
            const responseTime = endTime - startTime;

            // Log successful response
            this.logResponse(
              method,
              url,
              response.statusCode,
              responseTime,
              responseBody,
            );
          },
          error: (error) => {
            const endTime = Date.now();
            const responseTime = endTime - startTime;

            // Log error response
            this.logErrorResponse(
              method,
              url,
              response.statusCode || 500,
              responseTime,
              error,
            );
          },
        }),
      );
    }

    return next.handle();
  }

  private logRequest(
    method: string,
    url: string,
    body: any,
    query: any,
    params: any,
    ip?: string,
    userAgent?: string,
  ): void {
    const sanitizedBody = this.sanitizeBody(body);

    let logMessage = `→ ${method} ${url}`;

    if (ip) {
      logMessage += ` | IP: ${ip}`;
    }

    if (Object.keys(query).length > 0) {
      logMessage += ` | Query: ${JSON.stringify(query)}`;
    }

    if (Object.keys(params).length > 0) {
      logMessage += ` | Params: ${JSON.stringify(params)}`;
    }

    if (sanitizedBody && Object.keys(sanitizedBody).length > 0) {
      logMessage += ` | Body: ${JSON.stringify(sanitizedBody)}`;
    }

    if (userAgent && !userAgent.includes('ELB-HealthChecker')) {
      logMessage += ` | User-Agent: ${userAgent.substring(0, 100)}`;
    }

    // Skip logging for health checks and other monitoring endpoints
    if (this.shouldSkipLogging(url)) {
      return;
    }

    this.logger.log(logMessage);
  }

  private logResponse(
    method: string,
    url: string,
    statusCode: number,
    responseTime: number,
    responseBody?: any,
  ): void {
    if (this.shouldSkipLogging(url)) {
      return;
    }

    let logMessage = `← ${method} ${url} | ${statusCode} | ${responseTime}ms`;

    // Only log response body for errors or debug mode
    if (process.env.NODE_ENV === 'development' && responseBody) {
      const sanitizedResponse = this.sanitizeResponse(responseBody);
      if (sanitizedResponse) {
        const responseStr = JSON.stringify(sanitizedResponse);
        if (responseStr.length > 500) {
          logMessage += ` | Response: ${responseStr.substring(0, 500)}...`;
        } else {
          logMessage += ` | Response: ${responseStr}`;
        }
      }
    }

    // Use different log levels based on status code
    if (statusCode >= 500) {
      this.logger.error(logMessage);
    } else if (statusCode >= 400) {
      this.logger.warn(logMessage);
    } else {
      this.logger.log(logMessage);
    }
  }

  private logErrorResponse(
    method: string,
    url: string,
    statusCode: number,
    responseTime: number,
    error: any,
  ): void {
    if (this.shouldSkipLogging(url)) {
      return;
    }

    let logMessage = `← ${method} ${url} | ${statusCode} | ${responseTime}ms | ERROR`;

    if (error?.message) {
      logMessage += ` | ${error.message}`;
    }

    this.logger.error(logMessage);
  }

  private sanitizeBody(body: any): any {
    if (!body || typeof body !== 'object') {
      return body;
    }

    const sensitiveFields = [
      'password',
      'token',
      'secret',
      'key',
      'authorization',
      'auth',
      'credit',
      'ssn',
      'social',
    ];

    const sanitized = { ...body };

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    }

    return sanitized;
  }

  private sanitizeResponse(response: any): any {
    if (!response || typeof response !== 'object') {
      return response;
    }

    // Limit response logging to prevent huge logs
    if (Array.isArray(response)) {
      return {
        type: 'array',
        length: response.length,
        sample: response.slice(0, 2), // Just show first 2 items
      };
    }

    return response;
  }

  private shouldSkipLogging(url: string): boolean {
    const skipPatterns = ['/health', '/metrics', '/favicon.ico', '/robots.txt'];

    return skipPatterns.some((pattern) => url.includes(pattern));
  }
}
