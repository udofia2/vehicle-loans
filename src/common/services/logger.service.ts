import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
  VERBOSE = 4,
}

@Injectable()
export class LoggerService implements NestLoggerService {
  private context?: string;
  private logLevel: LogLevel = LogLevel.INFO;

  constructor(context?: string) {
    this.context = context;
    this.setLogLevel();
  }

  private setLogLevel(): void {
    const envLevel = process.env.LOG_LEVEL?.toLowerCase() || 'info';
    switch (envLevel) {
      case 'error':
        this.logLevel = LogLevel.ERROR;
        break;
      case 'warn':
        this.logLevel = LogLevel.WARN;
        break;
      case 'debug':
        this.logLevel = LogLevel.DEBUG;
        break;
      case 'verbose':
        this.logLevel = LogLevel.VERBOSE;
        break;
      default:
        this.logLevel = LogLevel.INFO;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.logLevel;
  }

  private formatMessage(level: string, message: any, context?: string): string {
    const timestamp = new Date().toISOString();
    const ctx = context || this.context || 'Application';
    const msg = typeof message === 'object' ? JSON.stringify(message) : message;
    return `[${timestamp}] [${level.toUpperCase()}] [${ctx}] ${msg}`;
  }

  log(message: any, context?: string): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.log(this.formatMessage('info', message, context));
    }
  }

  error(message: any, trace?: string, context?: string): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(this.formatMessage('error', message, context));
      if (trace) {
        console.error(`Stack trace: ${trace}`);
      }
    }
  }

  warn(message: any, context?: string): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage('warn', message, context));
    }
  }

  debug(message: any, context?: string): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(this.formatMessage('debug', message, context));
    }
  }

  verbose(message: any, context?: string): void {
    if (this.shouldLog(LogLevel.VERBOSE)) {
      console.log(this.formatMessage('verbose', message, context));
    }
  }

  // Additional utility methods
  logRequest(
    method: string,
    url: string,
    statusCode: number,
    responseTime: number,
  ): void {
    const message = `${method} ${url} - ${statusCode} - ${responseTime}ms`;
    if (statusCode >= 400) {
      this.error(message);
    } else {
      this.log(message);
    }
  }

  logDatabase(query: string, parameters?: any[], executionTime?: number): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      let message = `Database Query: ${query}`;
      if (parameters && parameters.length > 0) {
        message += ` | Parameters: ${JSON.stringify(parameters)}`;
      }
      if (executionTime !== undefined) {
        message += ` | Execution Time: ${executionTime}ms`;
      }
      this.debug(message);
    }
  }

  logExternalApi(
    service: string,
    method: string,
    url: string,
    statusCode?: number,
    responseTime?: number,
  ): void {
    let message = `External API [${service}] ${method} ${url}`;
    if (statusCode !== undefined) {
      message += ` - ${statusCode}`;
    }
    if (responseTime !== undefined) {
      message += ` - ${responseTime}ms`;
    }

    if (statusCode && statusCode >= 400) {
      this.error(message);
    } else {
      this.log(message);
    }
  }

  logValidationError(field: string, value: any, rule: string): void {
    const message = `Validation Error - Field: ${field}, Value: ${JSON.stringify(value)}, Rule: ${rule}`;
    this.warn(message);
  }

  logBusinessRule(
    rule: string,
    entity: string,
    entityId: any,
    success: boolean,
  ): void {
    const status = success ? 'PASSED' : 'FAILED';
    const message = `Business Rule [${rule}] ${status} for ${entity}:${entityId}`;
    if (success) {
      this.debug(message);
    } else {
      this.warn(message);
    }
  }
}
