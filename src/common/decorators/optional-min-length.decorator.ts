import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsOptionalMinLength(minLength: number, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isOptionalMinLength',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [minLength],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          // If the value is undefined or null, it's valid
          if (value === undefined || value === null || value === '') {
            return true;
          }
          // If a value is provided, check the minimum length
          return typeof value === 'string' && value.length >= args.constraints[0];
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be longer than or equal to ${args.constraints[0]} characters`;
        },
      },
    });
  };
}
