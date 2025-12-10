import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
  ValidationPipeOptions,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { ERROR_MESSAGES } from '../constants/error-messages.constants';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  private readonly validationOptions: ValidationPipeOptions;

  constructor(options?: ValidationPipeOptions) {
    this.validationOptions = {
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      disableErrorMessages: false,
      validationError: {
        target: false,
      },
      ...options,
    };
  }

  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    // Transform plain object to class instance
    const object = plainToClass(metatype, value);

    // Validate the object
    const errors = await validate(object, this.validationOptions);

    if (errors.length > 0) {
      throw new BadRequestException({
        message: ERROR_MESSAGES.VALIDATION.INVALID_FORMAT,
        errors: this.formatErrors(errors),
        statusCode: 400,
      });
    }

    return object;
  }

  private toValidate(metatype: any): boolean {
    const types: any[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private formatErrors(errors: any[]): any[] {
    return errors.map((error) => ({
      field: error.property,
      value: error.value,
      constraints: error.constraints,
      children:
        error.children && error.children.length > 0
          ? this.formatErrors(error.children)
          : undefined,
    }));
  }
}
