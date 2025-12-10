import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface StandardResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
  path: string;
  method: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  StandardResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<StandardResponse<T>> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((data) => {
        // If data is already in standard format, return as is
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

        // Extract pagination info if present
        let paginationInfo: StandardResponse<T>['pagination'] | undefined;
        let responseData = data;

        if (
          data &&
          typeof data === 'object' &&
          'data' in data &&
          'meta' in data
        ) {
          const paginatedData = data as any;
          responseData = paginatedData.data;

          if (paginatedData.meta) {
            const meta = paginatedData.meta;
            paginationInfo = {
              page: meta.page || meta.currentPage || 1,
              limit: meta.limit || meta.pageSize || meta.take || 10,
              total: meta.total || meta.itemCount || 0,
              totalPages:
                meta.totalPages ||
                meta.pageCount ||
                Math.ceil(
                  (meta.total || 0) /
                    (meta.limit || meta.pageSize || meta.take || 10),
                ),
              hasNextPage: meta.hasNextPage || false,
              hasPrevPage: meta.hasPrevPage || meta.hasPreviousPage || false,
            };
          }
        }

        // Determine success message based on HTTP method and status code
        const message = this.getSuccessMessage(
          request.method,
          response.statusCode,
        );

        const standardResponse: StandardResponse<T> = {
          success: true,
          statusCode: response.statusCode,
          message,
          data: responseData,
          timestamp: new Date().toISOString(),
          path: request.url,
          method: request.method,
        };

        // Add pagination if present
        if (paginationInfo) {
          standardResponse.pagination = paginationInfo;
        }

        return standardResponse;
      }),
    );
  }

  private getSuccessMessage(method: string, statusCode: number): string {
    // Handle specific status codes first
    switch (statusCode) {
      case 201:
        return 'Resource created successfully';
      case 202:
        return 'Request accepted for processing';
      case 204:
        return 'Resource deleted successfully';
      default:
        // Handle by HTTP method
        switch (method.toUpperCase()) {
          case 'GET':
            return 'Data retrieved successfully';
          case 'POST':
            return 'Resource created successfully';
          case 'PUT':
          case 'PATCH':
            return 'Resource updated successfully';
          case 'DELETE':
            return 'Resource deleted successfully';
          default:
            return 'Operation completed successfully';
        }
    }
  }
}
