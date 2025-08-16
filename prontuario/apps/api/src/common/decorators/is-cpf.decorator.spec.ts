import { validate } from 'class-validator';
import { IsCPF } from './is-cpf.decorator';

class TestClass {
  @IsCPF()
  cpf: string;
}

describe('IsCPF Decorator', () => {
  it('should validate correct CPF', async () => {
    const testObj = new TestClass();
    testObj.cpf = '123.456.789-09';

    const errors = await validate(testObj);
    expect(errors).toHaveLength(0);
  });

  it('should reject invalid CPF', async () => {
    const testObj = new TestClass();
    testObj.cpf = '123.456.789-10';

    const errors = await validate(testObj);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints?.isCPF).toBe('cpf deve ser um CPF válido');
  });

  it('should reject CPF with all same digits', async () => {
    const testObj = new TestClass();
    testObj.cpf = '111.111.111-11';

    const errors = await validate(testObj);
    expect(errors).toHaveLength(1);
  });

  it('should reject CPF with wrong length', async () => {
    const testObj = new TestClass();
    testObj.cpf = '123.456.789';

    const errors = await validate(testObj);
    expect(errors).toHaveLength(1);
  });
});
