export interface NestedAccountInput {
  profile: {
    name: string;
  };
  contacts: Array<{
    email: string;
  }>;
}

export const validNestedAccount: NestedAccountInput = {
  profile: { name: 'Ada Lovelace' },
  contacts: [{ email: 'ada@example.com' }],
};

export const invalidNestedAccount: NestedAccountInput = {
  profile: { name: '' },
  contacts: [{ email: 'invalid' }],
};
