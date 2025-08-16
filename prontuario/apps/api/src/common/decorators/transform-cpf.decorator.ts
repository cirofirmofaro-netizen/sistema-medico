import { Transform } from 'class-transformer';

export function TransformCPF() {
  return Transform(({ value }) => {
    if (typeof value !== 'string') {
      return value;
    }

    // Remove caracteres não numéricos
    const cpf = value.replace(/\D/g, '');

    // Retorna apenas números se não for um CPF válido
    if (cpf.length !== 11) {
      return cpf;
    }

    // Formata como XXX.XXX.XXX-XX
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  });
}
