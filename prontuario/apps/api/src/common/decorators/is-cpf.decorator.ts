import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsCPF(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isCPF',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') {
            return false;
          }

          // Remove caracteres não numéricos
          const cpf = value.replace(/\D/g, '');

          // Verifica se tem 11 dígitos
          if (cpf.length !== 11) {
            return false;
          }

          // Verifica se todos os dígitos são iguais
          if (/^(\d)\1{10}$/.test(cpf)) {
            return false;
          }

          // Validação do primeiro dígito verificador
          let sum = 0;
          for (let i = 0; i < 9; i++) {
            sum += parseInt(cpf.charAt(i)) * (10 - i);
          }
          let remainder = sum % 11;
          let digit1 = remainder < 2 ? 0 : 11 - remainder;

          if (parseInt(cpf.charAt(9)) !== digit1) {
            return false;
          }

          // Validação do segundo dígito verificador
          sum = 0;
          for (let i = 0; i < 10; i++) {
            sum += parseInt(cpf.charAt(i)) * (11 - i);
          }
          remainder = sum % 11;
          let digit2 = remainder < 2 ? 0 : 11 - remainder;

          if (parseInt(cpf.charAt(10)) !== digit2) {
            return false;
          }

          return true;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} deve ser um CPF válido`;
        },
      },
    });
  };
}
