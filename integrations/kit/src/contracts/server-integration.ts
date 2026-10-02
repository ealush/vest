import { assert } from '../assertions/types.js';

export interface ServerIntegrationResponse<Output, ErrorBody> {
  status: number;
  body: Output | ErrorBody;
}

export interface ServerIntegrationAdapter<Input, Output, ErrorBody> {
  request(input: Input): Promise<ServerIntegrationResponse<Output, ErrorBody>>;
}

export interface ServerIntegrationContract<Input> {
  validInput: Input;
  invalidInput: Input;
  acceptedStatus: number;
  rejectedStatus: number;
}

export async function runServerIntegrationContract<Input, Output, ErrorBody>(
  adapter: ServerIntegrationAdapter<Input, Output, ErrorBody>,
  contract: ServerIntegrationContract<Input>,
): Promise<void> {
  const accepted = await adapter.request(contract.validInput);
  assert(
    accepted.status === contract.acceptedStatus,
    `Expected accepted status ${contract.acceptedStatus}, received ${accepted.status}`,
  );

  const rejected = await adapter.request(contract.invalidInput);
  assert(
    rejected.status === contract.rejectedStatus,
    `Expected rejected status ${contract.rejectedStatus}, received ${rejected.status}`,
  );
}
