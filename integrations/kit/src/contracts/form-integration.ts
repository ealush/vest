import { assert } from '../assertions/types.js';

export interface FormIntegrationAdapter<Input, Output, Errors> {
  submit(
    values: Input,
  ): Promise<
    { success: true; value: Output } | { success: false; errors: Errors }
  >;
  validateFields?(values: Input, names: readonly string[]): Promise<Errors>;
  reset?(): void;
}

export interface FormIntegrationContract<Input, Output> {
  validInput: Input;
  invalidInput: Input;
  isSuccessfulOutput(value: Output): boolean;
}

export async function runFormIntegrationContract<Input, Output, Errors>(
  adapter: FormIntegrationAdapter<Input, Output, Errors>,
  contract: FormIntegrationContract<Input, Output> & {
    hasErrors(errors: Errors): boolean;
  },
): Promise<void> {
  const invalid = await adapter.submit(contract.invalidInput);
  assert(!invalid.success, 'Expected invalid form submission to fail');
  assert(contract.hasErrors(invalid.errors), 'Expected form errors');

  const valid = await adapter.submit(contract.validInput);
  assert(valid.success, 'Expected valid form submission to succeed');
  assert(
    contract.isSuccessfulOutput(valid.value),
    'Form output did not match the expected value',
  );
}
