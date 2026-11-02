import { registerDecorator, ValidationOptions } from 'class-validator';
import { assertSafeUrl } from '../url-safety.js';

export function IsSafeUrl(options?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isSafeUrl',
      target: object.constructor,
      propertyName,
      options,
      validator: {
        validate(value: unknown): boolean {
          if (typeof value !== 'string') return false;
          try {
            assertSafeUrl(value);
            return true;
          } catch {
            return false;
          }
        },
        defaultMessage(): string {
          return 'URL must be a valid public http(s) URL (private/internal targets are blocked)';
        },
      },
    });
  };
}
