import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsPhone(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isPhone',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') {
            return false;
          }

          // Remove caracteres não numéricos
          const phone = value.replace(/\D/g, '');

          // Verifica se tem 10 ou 11 dígitos (com DDD)
          if (phone.length < 10 || phone.length > 11) {
            return false;
          }

          // Verifica se começa com DDD válido (11-99)
          const ddd = parseInt(phone.substring(0, 2));
          if (ddd < 11 || ddd > 99) {
            return false;
          }

          // Verifica se o número é válido
          const number = phone.substring(2);
          if (number.length < 8 || number.length > 9) {
            return false;
          }

          return true;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} deve ser um telefone válido`;
        },
      },
    });
  };
}
